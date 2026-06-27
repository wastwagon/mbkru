/**
 * Idempotent default Queen Mother steward accounts — one per community without leadership.
 * Used by `prisma/seed.mjs` and `npm run db:seed:community-stewards`.
 *
 * Email: steward.{community-slug}@{SEED_COMMUNITY_STEWARD_EMAIL_DOMAIN}
 * Password: SEED_COMMUNITY_STEWARD_PASSWORD (shared default for all seeded stewards)
 *
 * Skips communities that already have an ACTIVE MODERATOR or QUEEN_MOTHER_VERIFIED member.
 * Opt out: SEED_COMMUNITY_STEWARDS=0
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const STEWARD_ROLES = ["MODERATOR", "QUEEN_MOTHER_VERIFIED"];

export function communityStewardEmail(slug, emailDomain) {
  return `steward.${slug}@${emailDomain}`;
}

export function communityStewardDefaultsFromEnv() {
  return {
    password: (process.env.SEED_COMMUNITY_STEWARD_PASSWORD || "CommunitySteward!change-me-2026").trim(),
    emailDomain: (process.env.SEED_COMMUNITY_STEWARD_EMAIL_DOMAIN || "mbkru-stewards.local")
      .trim()
      .toLowerCase(),
    resetPasswordOnExisting: process.env.SEED_COMMUNITY_STEWARD_RESET_PASSWORD === "1",
  };
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @returns {Promise<{ created: number; skipped: number; total: number; credentials: Array<{ slug: string; email: string; name: string }> }>}
 */
export async function seedDefaultCommunityStewards(prisma) {
  if (
    process.env.SEED_COMMUNITY_STEWARDS === "0" ||
    process.env.SEED_COMMUNITY_STEWARDS === "false"
  ) {
    console.log("SEED_COMMUNITY_STEWARDS=0 — skipping default community steward accounts.");
    return { created: 0, skipped: 0, total: 0, credentials: [] };
  }

  const { password, emailDomain, resetPasswordOnExisting } = communityStewardDefaultsFromEnv();
  const hash = await bcrypt.hash(password, 12);

  const communities = await prisma.community.findMany({
    select: { id: true, slug: true, name: true, traditionalAreaName: true, regionId: true },
    orderBy: { slug: "asc" },
  });

  let created = 0;
  let skipped = 0;
  /** @type {Array<{ slug: string; email: string; name: string }>} */
  const credentials = [];

  for (const c of communities) {
    const hasLeadership = await prisma.communityMembership.findFirst({
      where: {
        communityId: c.id,
        state: "ACTIVE",
        role: { in: STEWARD_ROLES },
      },
      select: { id: true },
    });
    if (hasLeadership) {
      skipped++;
      continue;
    }

    const email = communityStewardEmail(c.slug, emailDomain);
    const displayName = c.traditionalAreaName
      ? `${c.traditionalAreaName} (seed steward)`
      : `${c.name} (seed steward)`;

    let member = await prisma.member.findUnique({ where: { email }, select: { id: true } });
    if (member) {
      if (resetPasswordOnExisting) {
        await prisma.member.update({
          where: { id: member.id },
          data: { password: hash, displayName },
        });
      }
    } else {
      member = await prisma.member.create({
        data: {
          email,
          password: hash,
          displayName,
          regionId: c.regionId,
        },
        select: { id: true },
      });
    }

    await prisma.communityMembership.upsert({
      where: {
        communityId_memberId: { communityId: c.id, memberId: member.id },
      },
      create: {
        communityId: c.id,
        memberId: member.id,
        role: "QUEEN_MOTHER_VERIFIED",
        state: "ACTIVE",
      },
      update: {
        role: "QUEEN_MOTHER_VERIFIED",
        state: "ACTIVE",
        banReason: null,
        bannedAt: null,
      },
    });

    created++;
    credentials.push({ slug: c.slug, email, name: c.name });
  }

  console.log(
    `Community stewards: ${created} provisioned, ${skipped} skipped (already had leadership), ${communities.length} communities checked.`,
  );

  if (credentials.length > 0) {
    writeStewardManifest(credentials, { emailDomain, passwordSetViaEnv: Boolean(process.env.SEED_COMMUNITY_STEWARD_PASSWORD) });
  }

  return { created, skipped, total: communities.length, credentials };
}

function writeStewardManifest(credentials, meta) {
  const varDir = join(__dirname, "..", "var");
  if (!existsSync(varDir)) mkdirSync(varDir, { recursive: true });

  const manifestPath = join(varDir, "community-steward-logins.json");
  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        emailPattern: `steward.{slug}@${meta.emailDomain}`,
        passwordNote: meta.passwordSetViaEnv
          ? "Password from SEED_COMMUNITY_STEWARD_PASSWORD"
          : "Default password CommunitySteward!change-me-2026 — rotate via Admin or SEED_COMMUNITY_STEWARD_PASSWORD",
        managePathPattern: "/communities/{slug}/manage",
        portalPathPattern: "/communities/{slug}/portal",
        accounts: credentials,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`Community steward manifest written: ${manifestPath}`);
}

/** Standalone: `node prisma/seed-community-stewards.mjs` */
async function mainStandalone() {
  const prisma = new PrismaClient();
  try {
    const result = await seedDefaultCommunityStewards(prisma);
    logStewardLoginReference(result.credentials, communityStewardDefaultsFromEnv());
  } finally {
    await prisma.$disconnect();
  }
}

export function logStewardLoginReference(credentials, { password, emailDomain }) {
  if (credentials.length === 0) return;

  const lines = [
    "",
    "----------------------------------------------------------------",
    "MBKRU community steward logins (seed — rotate before production pilots)",
    "----------------------------------------------------------------",
    `Password (all new stewards): ${password}`,
    `Email pattern: steward.{slug}@${emailDomain}`,
    "",
  ];

  const show = credentials.slice(0, 12);
  for (const c of show) {
    lines.push(`  ${c.email}  →  /communities/${c.slug}/manage`);
  }
  if (credentials.length > show.length) {
    lines.push(`  … and ${credentials.length - show.length} more (see var/community-steward-logins.json)`);
  }
  lines.push("----------------------------------------------------------------", "");
  console.log(lines.join("\n"));
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  mainStandalone().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
