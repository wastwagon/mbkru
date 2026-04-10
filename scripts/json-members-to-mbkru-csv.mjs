#!/usr/bin/env node
/**
 * Convert ghanamps-style MP JSON → MBKRU parliament CSV import format.
 * Slug rules must stay aligned with normalizeSlug in src/lib/parliament-csv-parse.ts
 *
 * Usage:
 *   ghanamps members > mps.json
 *   node scripts/json-members-to-mbkru-csv.mjs mps.json > members.csv
 *   node scripts/json-members-to-mbkru-csv.mjs mps.json --list-constituency-slugs
 *
 * Checked-in small sample (no ghanamps required): prisma/data/parliament-members.starter.csv
 *
 * @see docs/DATA_SOURCES.md
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function normalizeSlug(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function csvCell(s) {
  const t = String(s ?? "");
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

function parseArgs(argv) {
  const listOnly = argv.includes("--list-constituency-slugs");
  const paths = argv.filter((a) => !a.startsWith("-"));
  return { path: paths[0], listOnly };
}

function main() {
  const argv = process.argv.slice(2);
  const { path: inputPath, listOnly } = parseArgs(argv);

  if (!inputPath) {
    console.error(
      "Usage: node scripts/json-members-to-mbkru-csv.mjs <members.json> [--list-constituency-slugs]",
    );
    process.exit(1);
  }

  const abs = resolve(process.cwd(), inputPath);
  let data;
  try {
    data = JSON.parse(readFileSync(abs, "utf8"));
  } catch (e) {
    console.error(`Failed to read JSON: ${abs}`, e.message);
    process.exit(1);
  }

  if (!Array.isArray(data)) {
    console.error("Expected top-level JSON array of member objects.");
    process.exit(1);
  }

  const constituencySlugs = new Set();
  const rows = [];
  const slugCounts = new Map();

  for (const m of data) {
    const name = (m.name ?? "").trim();
    if (!name) continue;

    let baseSlug = normalizeSlug(name);
    if (!baseSlug) continue;
    const n = (slugCounts.get(baseSlug) ?? 0) + 1;
    slugCounts.set(baseSlug, n);
    const slug = n === 1 ? baseSlug : `${baseSlug}-${n}`;

    const party = (m.party ?? "").trim() || "";
    const constituency = (m.constituency ?? "").trim();
    const cSlug = constituency ? normalizeSlug(constituency) : "";
    if (cSlug) constituencySlugs.add(cSlug);

    rows.push({
      name,
      slug,
      role: "MP",
      party,
      constituency_slug: cSlug,
      active: "true",
    });
  }

  if (listOnly) {
    console.error("# Unique constituency_slug values (ensure these exist in DB):");
    for (const s of [...constituencySlugs].sort()) {
      console.log(s);
    }
    return;
  }

  const header = "name,slug,role,party,constituency_slug,active";
  const lines = [header];
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.name),
        csvCell(r.slug),
        csvCell(r.role),
        csvCell(r.party),
        csvCell(r.constituency_slug),
        csvCell(r.active),
      ].join(","),
    );
  }
  console.log(lines.join("\n"));
}

main();
