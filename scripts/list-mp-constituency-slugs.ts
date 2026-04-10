/**
 * List unique `constituency_slug` values from a ghanamps JSON file (same shape as `ghanamps members`).
 *
 *   npx tsx scripts/list-mp-constituency-slugs.ts path/to/mps.json
 *
 * @see docs/DATA_SOURCES.md
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { listConstituencySlugsFromGhanampsJson } from "../src/lib/ghanamps-to-mbkru-csv";

const p = process.argv[2];
if (!p) {
  console.error("Usage: npx tsx scripts/list-mp-constituency-slugs.ts <members.json>");
  process.exit(1);
}

const data = JSON.parse(readFileSync(resolve(process.cwd(), p), "utf8"));
for (const s of listConstituencySlugsFromGhanampsJson(data)) {
  console.log(s);
}
