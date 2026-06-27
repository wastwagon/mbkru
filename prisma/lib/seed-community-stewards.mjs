/**
 * Idempotent default Queen Mother / moderator logins for every community without leadership.
 * Used by `prisma db seed` and `npm run db:seed:community-stewards`.
 *
 * Email: steward.{community-slug}@{SEED_COMMUNITY_STEWARD_EMAIL_DOMAIN}
 * Password: SEED_COMMUNITY_STEWARD_PASSWORD (shared default for seed accounts)
 *
 * Skips communities that already have an ACTIVE MODERATOR or QUEEN_MOTHER_VERIFIED member.
 * Opt out: SEED_COMMUNITY_STEWARDS=0
 */

const STEWARD_ROLES = ["MODERATOR", "QUEEN_MOTHER_VERIFIED"];

/** @type {{ created: number; skipped: number; passwordPlain: string; emailDomain: string } | null} */
export let lastCommunityStewardSeedStats = null;

/**
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {import("bcryptjs")} bcrypt
 */
export async function seedCommunityStewards(prisma, bcrypt) {
  if (
    process.env.SEED_COMMUNITY_STEWARDS === "0" ||
    process.env.SEED_COMMUNITY_STEWARDS === "false"
  ) {
    console.log("SEED_COMMUNITY_STEWARDS=0 — skipping default community steward accounts.");
    lastCommunityStewardSeedStats = null;
    return { created: 0, skipped: 0 };
  }

  const passwordPlain = (
    process.env.SEED_COMMUNITY_STEWARD_PASSWORD || "CommunitySteward!change-me-2026"
  ).trim();
  const emailDomain = (
    process.env.SEED_COMMUNITY_STEWARD_EMAIL_DOMAIN || "mbkru-stewards.local"
  )
    .trim()
    .toLowerCase();

  if (!passwordPlain || passwordPlain.length < 8) {
    console.warn("SEED_COMMUNITY_STEWARDS: password too short — skipping steward seed.");
    lastCommunityStewardSeedStats = null;
    return { created: 0, skipped: 0 };
  }

  const passwordHash = await bcrypt.hash(passwordPlain, 12);

  const communities = await prisma.community.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      traditionalAreaName: true,
      regionId: true,
    },
    orderBy: { slug: "asc" },
  });

  let created = 0;
  let skipped = 0;

  for (const c of communities) {
    const existingLeadership = await prisma.communityMembership.findFirst({
      where: {
        communityId: c.id,
        state: "ACTIVE",
        role: { in: STEWARD_ROLES },
      },
      select: { id: true },
    });
    if (existingLeadership) {
      skipped++;
      continue;
    }

    const email = `steward.${c.slug}@${emailDomain}`;
    const role = c.slug.startsWith("mbkru-region-hub-") ? "MODERATOR" : "QUEEN_MOTHER_VERIFIED";
    const displayName = c.traditionalAreaName?.trim()
      ? `Queen Mother — ${c.traditionalAreaName.trim()}`
      : role === "MODERATOR"
        ? `Moderator — ${c.name}`
        : `Queen Mother — ${c.name}`;

    const member = await prisma.member.upsert({
      where: { email },
      create: {
        email,
        password: passwordHash,
        displayName,
        regionId: c.regionId,
      },
      update: {
        password: passwordHash,
        displayName,
      },
      select: { id: true },
    });

    await prisma.communityMembership.upsert({
      where: {
        communityId_memberId: { communityId: c.id, memberId: member.id },
      },
      create: {
        communityId: c.id,
        memberId: member.id,
        role,
        state: "ACTIVE",
      },
      update: {
        role,
        state: "ACTIVE",
        banReason: null,
        bannedAt: null,
      },
    });

    if (role === "QUEEN_MOTHER_VERIFIED") {
      await prisma.communityVerificationRequest.updateMany({
        where: {
          communityId: c.id,
          memberId: member.id,
          status: "SUBMITTED",
        },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewNotes: "Seed: default community steward.",
        },
      });
    }

    created++;
  }

  lastCommunityStewardSeedStats = { created, skipped, passwordPlain, emailDomain };

  console.log(
    `Community stewards: ${created} provisioned, ${skipped} skipped (existing leadership).`,
  );
  if (created > 0) {
    console.warn(
      "SEED_COMMUNITY_STEWARDS: rotate the shared steward password before real pilots — see seed login reference below.",
    );
  }

  return { created, skipped };
}
