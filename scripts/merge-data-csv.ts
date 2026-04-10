/**
 * Merge checked-in starter CSV rows into a bulk export (e.g. from ghanamps JSON via
 * `npm run data:members-csv`). Starter rows are appended only when their `slug` is not
 * already in the base file (case-insensitive).
 *
 * Usage:
 *   npx tsx scripts/merge-data-csv.ts parliament path/to/members.csv > merged-members.csv
 *   npx tsx scripts/merge-data-csv.ts constituency path/to/constituencies.csv > merged-constituencies.csv
 *
 * @see docs/DATA_SOURCES.md
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { mergeConstituencyCsvTexts, mergeParliamentMemberCsvTexts } from "../src/lib/merge-starter-csv";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function main() {
  const [, , kind, basePath] = process.argv;
  if (!kind || !basePath || kind === "--help" || kind === "-h") {
    console.error(
      `Usage:\n  npx tsx scripts/merge-data-csv.ts parliament <base.csv> > out.csv\n  npx tsx scripts/merge-data-csv.ts constituency <base.csv> > out.csv\n\n` +
        `Merges prisma/data/*.starter.csv into <base.csv> (dedupe by slug).`,
    );
    process.exit(kind ? 0 : 1);
  }

  const absBase = resolve(process.cwd(), basePath);
  const baseText = readFileSync(absBase, "utf8");

  let out: string;
  if (kind === "parliament") {
    const starterText = readFileSync(resolve(ROOT, "prisma/data/parliament-members.starter.csv"), "utf8");
    out = mergeParliamentMemberCsvTexts(baseText, starterText);
  } else if (kind === "constituency") {
    const starterText = readFileSync(resolve(ROOT, "prisma/data/constituencies.starter.csv"), "utf8");
    out = mergeConstituencyCsvTexts(baseText, starterText);
  } else {
    console.error(`Unknown kind "${kind}". Use parliament or constituency.`);
    process.exit(1);
  }

  process.stdout.write(out);
}

main();
