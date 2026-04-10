/**
 * Pull a **full MP roster** JSON (via local `ghanamps` CLI) and write a merged MBKRU import CSV.
 * Does not hit your database — import the file from Admin → Parliament (after constituencies exist).
 *
 * Prerequisites:
 *   - Install ghanamps: https://github.com/yeboahnanaosei/ghanamps (Go toolchain)
 *   - Or set MP_JSON_PATH to a file containing the same JSON array `ghanamps members` prints.
 *
 * Usage:
 *   npm run data:pull-mps
 *   MP_JSON_PATH=./mps.json npm run data:pull-mps
 *   GHANAMPS_BIN=/path/to/ghanamps npm run data:pull-mps
 *
 * Output: prisma/data/generated/parliament-members.bulk.csv
 *
 * @see docs/DATA_SOURCES.md
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ghanampsMembersToCsvText } from "../src/lib/ghanamps-to-mbkru-csv";
import { mergeParliamentMemberCsvTexts } from "../src/lib/merge-starter-csv";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "prisma/data/generated");
const OUT_FILE = resolve(OUT_DIR, "parliament-members.bulk.csv");
const STARTER = resolve(ROOT, "prisma/data/parliament-members.starter.csv");

function runGhanampsMembers(): string {
  const bin = process.env.GHANAMPS_BIN?.trim() || "ghanamps";
  const r = spawnSync(bin, ["members"], {
    encoding: "utf-8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.error) {
    throw new Error(
      `Could not run "${bin} members": ${r.error.message}\n` +
        `Install ghanamps (see https://github.com/yeboahnanaosei/ghanamps) or set MP_JSON_PATH to a JSON file.`,
    );
  }
  if (r.status !== 0) {
    throw new Error(
      `"${bin} members" exited ${r.status}\n${r.stderr || ""}\n` +
        `Install ghanamps or set MP_JSON_PATH to a JSON array export.`,
    );
  }
  return r.stdout;
}

function main() {
  const jsonPath = process.env.MP_JSON_PATH?.trim();
  const raw = jsonPath
    ? readFileSync(resolve(process.cwd(), jsonPath), "utf8")
    : runGhanampsMembers();

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("Invalid JSON from ghanamps / MP_JSON_PATH:", e);
    process.exit(1);
  }

  const baseCsv = ghanampsMembersToCsvText(data);
  const starterText = readFileSync(STARTER, "utf8");
  const merged = mergeParliamentMemberCsvTexts(baseCsv, starterText);

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, merged, "utf8");

  const n = merged.split("\n").filter((l) => l.trim() && !l.startsWith("name,")).length;
  console.error(`Wrote ${OUT_FILE} (${n} MP rows, starter slugs merged/deduped).`);
  console.error("Next: ensure every constituency_slug exists in DB, then POST /api/admin/parliament-members/import");
  console.error("Tip: save JSON as mps.json, then: npx tsx scripts/list-mp-constituency-slugs.ts mps.json");
  console.error("      or: node scripts/json-members-to-mbkru-csv.mjs mps.json --list-constituency-slugs");
}

main();
