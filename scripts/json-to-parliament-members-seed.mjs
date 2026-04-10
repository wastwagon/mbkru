#!/usr/bin/env node
/**
 * ghanamps members JSON → prisma/data/parliament-members.seed.json (for prisma db seed).
 * Usage: ghanamps members > mps.json && node scripts/json-to-parliament-members-seed.mjs mps.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const input = resolve(process.cwd(), process.argv[2] || "");
if (!input) {
  console.error("Usage: node scripts/json-to-parliament-members-seed.mjs <members.json>");
  process.exit(1);
}
const data = JSON.parse(readFileSync(input, "utf8"));
if (!Array.isArray(data)) {
  console.error("Expected JSON array");
  process.exit(1);
}

function normalizeSlug(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const slugCounts = new Map();
const rows = [];
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
  const constituency_slug = constituency ? normalizeSlug(constituency) : "";
  rows.push({
    name,
    slug,
    role: "MP",
    party,
    constituency_slug: constituency_slug || undefined,
    active: true,
  });
}

const out = resolve(process.cwd(), "prisma/data/parliament-members.seed.json");
writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
console.error(`Wrote ${out} (${rows.length} MPs). Re-run prisma db seed to load.`);
