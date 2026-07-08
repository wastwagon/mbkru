#!/usr/bin/env node
/**
 * Toggle public under-construction gate in Postgres (all programme content stays in DB).
 *
 *   npm run ops:construction:status
 *   npm run ops:construction:on
 *   npm run ops:construction:off
 *
 * Only signed-in admins can browse the full site while the gate is on.
 * See docs/MEMBER_FINDINGS_REMEDIATION_PHASES.md and docs/OPS_RUNBOOK.md.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const constructionCopy = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/lib/construction-gate-copy.json"), "utf8"),
);

const SITE_CONFIG_ID = "default";

const DEFAULT_HEADLINE = constructionCopy.headline;
const DEFAULT_BODY = constructionCopy.body;

function usage() {
  console.log(`Usage:
  node scripts/ops-site-visibility.mjs status
  node scripts/ops-site-visibility.mjs on [--headline "…"] [--body "…"]
  node scripts/ops-site-visibility.mjs off

Env override (deploy): PUBLIC_UNDER_CONSTRUCTION=1 forces the gate on regardless of DB.
`);
}

const prisma = new PrismaClient();

function parseArgs(argv) {
  const cmd = argv[0];
  let headline;
  let body;
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === "--headline" && argv[i + 1]) {
      headline = argv[++i];
    } else if (argv[i] === "--body" && argv[i + 1]) {
      body = argv[++i];
    }
  }
  return { cmd, headline, body };
}

async function readRow() {
  return prisma.siteConfig.findUnique({ where: { id: SITE_CONFIG_ID } });
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("[ops-site-visibility] DATABASE_URL is required.");
    process.exit(1);
  }

  const { cmd, headline, body } = parseArgs(process.argv.slice(2));
  if (!cmd || !["status", "on", "off"].includes(cmd)) {
    usage();
    process.exit(1);
  }

  const envForcedOn = ["1", "true", "yes", "on"].includes(
    process.env.PUBLIC_UNDER_CONSTRUCTION?.trim().toLowerCase() ?? "",
  );
  const envForcedMsg = envForcedOn
    ? "PUBLIC_UNDER_CONSTRUCTION env is set — gate is forced ON at runtime regardless of DB."
    : null;

  if (cmd === "status") {
    const row = await readRow();
    console.log("[ops-site-visibility] SiteConfig row:", row ?? "(none — defaults to gate OFF)");
    if (envForcedMsg) console.log("[ops-site-visibility]", envForcedMsg);
    return;
  }

  if (cmd === "on") {
    const row = await prisma.siteConfig.upsert({
      where: { id: SITE_CONFIG_ID },
      create: {
        id: SITE_CONFIG_ID,
        publicUnderConstruction: true,
        constructionHeadline: (headline ?? DEFAULT_HEADLINE).slice(0, 200),
        constructionBody: (body ?? DEFAULT_BODY).slice(0, 4000),
      },
      update: {
        publicUnderConstruction: true,
        ...(headline !== undefined ? { constructionHeadline: headline.slice(0, 200) } : {}),
        ...(body !== undefined ? { constructionBody: body.slice(0, 4000) } : {}),
        ...(!headline && !body
          ? {
              constructionHeadline: DEFAULT_HEADLINE,
              constructionBody: DEFAULT_BODY,
            }
          : {}),
      },
    });
    console.log("[ops-site-visibility] Public gate ON — visitors see /under-construction.");
    console.log("  Admins: sign in at /admin/login then open / to preview the full site.");
    console.log("  Headline:", row.constructionHeadline);
    console.log("  Gate may take up to ~5s to apply on running instances (proxy cache).");
    if (envForcedMsg) console.log("[ops-site-visibility]", envForcedMsg);
    return;
  }

  if (cmd === "off") {
    const row = await prisma.siteConfig.upsert({
      where: { id: SITE_CONFIG_ID },
      create: { id: SITE_CONFIG_ID, publicUnderConstruction: false },
      update: { publicUnderConstruction: false },
    });
    console.log("[ops-site-visibility] Public gate OFF — site open to visitors (subject to member/auth rules).");
    console.log("  publicUnderConstruction:", row.publicUnderConstruction);
    if (envForcedOn) {
      console.warn(
        "[ops-site-visibility] WARNING: PUBLIC_UNDER_CONSTRUCTION is still set in env — gate remains ON until you unset it.",
      );
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
