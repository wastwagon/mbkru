/**
 * Download Wikipedia wikitext for "List of parliamentary constituencies of Ghana",
 * parse constituency tables, merge prisma/data/constituencies.starter.csv, write generated CSV.
 *
 *   npm run data:pull-constituencies
 *
 * **Licensing:** Wikipedia text is CC BY-SA — attribute in your about/data page if you redistribute.
 * **Accuracy:** This is a convenience import; verify against EC Ghana before relying in production.
 *
 * @see docs/DATA_SOURCES.md
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { mergeConstituencyCsvTexts } from "../src/lib/merge-starter-csv";
import {
  parseGhanaConstituenciesFromWikipediaWikitext,
  wikiConstituenciesToCsvText,
} from "../src/lib/wikipedia-ghana-constituencies";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = resolve(ROOT, "prisma/data/generated");
const OUT_FILE = resolve(OUT_DIR, "constituencies.wikipedia.csv");
const STARTER = resolve(ROOT, "prisma/data/constituencies.starter.csv");

const WIKI_API =
  "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_parliamentary_constituencies_of_Ghana&prop=wikitext&format=json&origin=*";

async function main() {
  const res = await fetch(WIKI_API, {
    headers: { "User-Agent": "MBKRU-website-data-script/1.0 (https://github.com/wastwagon/mbkru; constituency import)" },
  });
  if (!res.ok) {
    console.error("Wikipedia API error:", res.status, await res.text());
    process.exit(1);
  }
  const json = (await res.json()) as { parse?: { wikitext?: { "*": string } } };
  const wikitext = json.parse?.wikitext?.["*"];
  if (!wikitext) {
    console.error("Unexpected Wikipedia API shape:", JSON.stringify(json).slice(0, 500));
    process.exit(1);
  }

  const rows = parseGhanaConstituenciesFromWikipediaWikitext(wikitext);
  const baseCsv = wikiConstituenciesToCsvText(rows);
  const starterText = readFileSync(STARTER, "utf8");
  const merged = mergeConstituencyCsvTexts(baseCsv, starterText);

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, merged, "utf8");

  const n = merged.split("\n").filter((l) => l.trim() && !l.startsWith("name,")).length;
  console.error(`Wrote ${OUT_FILE} (${n} constituency rows; includes starter merge).`);
  console.error("Source: https://en.wikipedia.org/wiki/List_of_parliamentary_constituencies_of_Ghana (CC BY-SA).");
  console.error("Verify slugs against EC Ghana + ghanamps constituency_slug before MP import.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
