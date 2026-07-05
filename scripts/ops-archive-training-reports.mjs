#!/usr/bin/env node
/**
 * Archive demo/seed/test citizen reports in Postgres (reversible via admin).
 *
 * Dry-run (default): npm run ops:archive-training-reports
 * Apply:            npm run ops:archive-training-reports -- --apply
 *
 * See docs/MEMBER_FINDINGS_REMEDIATION_PHASES.md Phase R1b.
 */
import { PrismaClient } from "@prisma/client";

const PREFIXES = ["MBKRU-DEMO-", "MBKRU-SEED-"];

function isTrainingRow(row) {
  const code = row.trackingCode.trim().toUpperCase();
  if (PREFIXES.some((p) => code.startsWith(p))) return true;
  return /testing\s+phase/i.test(row.title.trim());
}

const apply = process.argv.includes("--apply");
const prisma = new PrismaClient();

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("[ops-archive-training] DATABASE_URL is required.");
    process.exit(1);
  }

  const candidates = await prisma.citizenReport.findMany({
    where: { status: { not: "ARCHIVED" } },
    select: { id: true, trackingCode: true, title: true, status: true, kind: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const training = candidates.filter(isTrainingRow);

  if (training.length === 0) {
    console.log("[ops-archive-training] No non-archived training reports found.");
    return;
  }

  console.log(
    `[ops-archive-training] Found ${training.length} training report(s) (${candidates.length} non-archived total):`,
  );
  for (const r of training) {
    console.log(`  - ${r.trackingCode} · ${r.kind} · ${r.status} · ${r.title.slice(0, 60)}`);
  }

  if (!apply) {
    console.log("\n[ops-archive-training] Dry run — pass --apply to set status ARCHIVED.");
    return;
  }

  const ids = training.map((r) => r.id);
  const result = await prisma.citizenReport.updateMany({
    where: { id: { in: ids } },
    data: { status: "ARCHIVED" },
  });

  console.log(`\n[ops-archive-training] Archived ${result.count} report(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
