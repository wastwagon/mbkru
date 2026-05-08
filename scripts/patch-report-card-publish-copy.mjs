#!/usr/bin/env node
/**
 * One-off: replace legacy "pilot (layout & workflow)" report-card cycle copy with
 * the current default from prisma/seed.mjs (keep REPORT_CARD_* strings in sync manually).
 *
 *   DATABASE_URL=... node scripts/patch-report-card-publish-copy.mjs
 *   REPORT_CARD_CYCLE_YEAR=2026 DATABASE_URL=... node scripts/patch-report-card-publish-copy.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const YEAR = Number.parseInt(process.env.REPORT_CARD_CYCLE_YEAR || "2026", 10);
const LEGACY_SNIPPET = "pilot (layout & workflow)";

const REPORT_CARD_DEFAULT_LABEL = `People's Report Card ${YEAR}`;
const REPORT_CARD_DEFAULT_METHODOLOGY = [
  `Published cycle for ${YEAR}. Roster: verify sitting MPs at https://www.parliament.gh/members .`,
  "Overall scores and MP narratives are filled only after MBKRU methodology sign-off and evidence review (see /methodology). Seed rows use placeholders until editors publish reviewed content in /admin/report-card.",
  "Starter seed MPs: Bryan Acheampong (Abetifi), John Dramani Mahama (Bole Bamboi), Zanetor Agyeman-Rawlings (Klottey Korle) — confirm against parliament.gh after by-elections or roster changes.",
].join("\n\n");

const prisma = new PrismaClient();

try {
  const cycle = await prisma.reportCardCycle.findUnique({
    where: { year: YEAR },
    select: { id: true, label: true, methodology: true },
  });
  if (!cycle) {
    console.log(`[patch-report-card] no ReportCardCycle for year=${YEAR} — nothing to do.`);
    process.exit(0);
  }

  const isLegacy =
    cycle.label.includes(LEGACY_SNIPPET) || cycle.methodology.includes(LEGACY_SNIPPET);
  if (!isLegacy) {
    console.log(
      `[patch-report-card] year=${YEAR} does not contain legacy pilot copy — skipping (avoid overwriting custom text).`,
    );
    process.exit(0);
  }

  await prisma.reportCardCycle.update({
    where: { id: cycle.id },
    data: {
      label: REPORT_CARD_DEFAULT_LABEL,
      methodology: REPORT_CARD_DEFAULT_METHODOLOGY,
    },
  });
  console.log(`[patch-report-card] updated cycle year=${YEAR} to default publish copy.`);
} finally {
  await prisma.$disconnect();
}
