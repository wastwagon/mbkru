#!/usr/bin/env node
/**
 * Convert MBKRU constituency CSV → prisma/data/constituencies.seed.json
 * Usage: node scripts/csv-to-constituencies-seed-json.mjs prisma/data/generated/constituencies.wikipedia.csv
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function splitCsvLine(line) {
  const result = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      result.push(field.trim());
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  result.push(field.trim());
  return result;
}

const input = resolve(process.cwd(), process.argv[2] || "prisma/data/generated/constituencies.wikipedia.csv");
const out = resolve(process.cwd(), "prisma/data/constituencies.seed.json");
const text = readFileSync(input, "utf8");
const lines = text.split(/\r?\n/).filter((l) => l.trim());
const header = splitCsvLine(lines[0]);
if (header[0]?.toLowerCase() !== "name") {
  console.error("Expected constituency CSV header");
  process.exit(1);
}
const rows = [];
for (let li = 1; li < lines.length; li++) {
  const cells = splitCsvLine(lines[li]);
  if (cells.length < 3) continue;
  rows.push({ name: cells[0], slug: cells[1], region_slug: cells[2] });
}
writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
console.error(`Wrote ${out} (${rows.length} rows)`);
