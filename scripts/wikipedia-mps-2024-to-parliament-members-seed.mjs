#!/usr/bin/env node
/**
 * Fetch English Wikipedia "List of MPs elected in the 2024 Ghanaian general election"
 * (CC BY-SA 4.0) and write prisma/data/parliament-members.seed.json.
 *
 * Constituency slugs are matched against prisma/data/constituencies.seed.json (same normalisation
 * as parliament import). Unmatched rows still appear with constituency_slug omitted (MP loads with
 * null constituency).
 *
 * Usage: node scripts/wikipedia-mps-2024-to-parliament-members-seed.mjs
 *
 * @see https://en.wikipedia.org/wiki/List_of_MPs_elected_in_the_2024_Ghanaian_general_election
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "prisma/data/parliament-members.seed.json");
const CONSTITUENCIES_JSON = resolve(ROOT, "prisma/data/constituencies.seed.json");

const WIKI_API = "https://en.wikipedia.org/w/api.php";
const PAGE = "List_of_MPs_elected_in_the_2024_Ghanaian_general_election";

function normalizeSlug(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripRefs(s) {
  return s.replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi, "").trim();
}

/** Display text from [[Page]] or [[Page|Label]] or plain. */
function wikiCellText(s) {
  const t = stripRefs(s).replace(/^\|\s*/, "").trim();
  const m = t.match(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/);
  if (m) return m[1].trim();
  return t.replace(/\[\[|\]\]/g, "").trim();
}

function abbrevParty(raw) {
  const p = stripRefs(raw).trim().replace(/\s+/g, " ");
  const u = p.toUpperCase();
  if (u.startsWith("NDC")) return "NDC";
  if (u.startsWith("NPP")) return "NPP";
  if (u.startsWith("CPP")) return "CPP";
  if (u.startsWith("PPP")) return "PPP";
  if (u.startsWith("PNC")) return "PNC";
  if (u.startsWith("GUM") || u.includes("GHANA UNION MOVEMENT")) return "GUM";
  if (u.startsWith("INDEPENDENT") || u === "IND") return "Independent";
  if (p.length <= 40) return p;
  return p.slice(0, 37) + "…";
}

function loadConstituencyLookup() {
  const rows = JSON.parse(readFileSync(CONSTITUENCIES_JSON, "utf8"));
  const bySlug = new Map();
  const byNormName = new Map();
  for (const r of rows) {
    if (!r?.slug || !r?.name) continue;
    bySlug.set(r.slug, r.name);
    const key = r.name
      .toLowerCase()
      .replace(/\([^)]*\)/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    if (!byNormName.has(key)) byNormName.set(key, r.slug);
  }
  return { byNormName };
}

function matchConstituencySlug(displayName, { byNormName }) {
  const key = displayName
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (byNormName.has(key)) return byNormName.get(key);
  const asSlug = normalizeSlug(displayName.replace(/\([^)]*\)/g, ""));
  if (byNormName.has(key.replace(/\s+/g, " "))) return byNormName.get(key);
  /** Try slug-shaped match against known slugs */
  for (const [k, slug] of byNormName) {
    if (normalizeSlug(k) === asSlug) return slug;
  }
  return undefined;
}

async function fetchWikitext() {
  const u = new URL(WIKI_API);
  u.searchParams.set("action", "query");
  u.searchParams.set("titles", PAGE);
  u.searchParams.set("prop", "revisions");
  u.searchParams.set("rvprop", "content");
  u.searchParams.set("rvslots", "main");
  u.searchParams.set("format", "json");
  const res = await fetch(u);
  if (!res.ok) throw new Error(`Wikipedia API ${res.status}`);
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  const w = page?.revisions?.[0]?.slots?.main?.["*"];
  if (!w) throw new Error("No wikitext in API response");
  return w;
}

function parseRows(wikitext) {
  const lookup = loadConstituencyLookup();
  const lines = wikitext.split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t.startsWith("|")) continue;
    if (t.includes("colspan=")) continue;
    if (t.includes("! Constituency")) continue;
    if (t.includes("! width=")) continue;
    if (!t.includes("[[")) continue;
    const cells = t.split("||").map((c) => c.trim());
    if (cells.length < 3) continue;
    const constCell = cells[0].replace(/^\|\s*/, "");
    const mpCell = cells[1];
    const partyCell = cells[2];
    const constituencyName = wikiCellText(constCell);
    const mpName = wikiCellText(mpCell);
    if (!constituencyName || !mpName) continue;
    if (/^===/.test(constituencyName)) continue;
    const party = abbrevParty(partyCell);
    const constituency_slug = matchConstituencySlug(constituencyName, lookup);
    out.push({ name: mpName, party, constituency_slug, constituencyName });
  }
  return out;
}

function toSeedRows(parsed) {
  const slugCounts = new Map();
  const rows = [];
  for (const r of parsed) {
    let baseSlug = normalizeSlug(r.name);
    if (!baseSlug) continue;
    const n = (slugCounts.get(baseSlug) ?? 0) + 1;
    slugCounts.set(baseSlug, n);
    const slug = n === 1 ? baseSlug : `${baseSlug}-${n}`;
    rows.push({
      name: r.name,
      slug,
      role: "MP",
      party: r.party,
      ...(r.constituency_slug ? { constituency_slug: r.constituency_slug } : {}),
      active: true,
    });
  }
  return rows;
}

async function main() {
  console.error("Fetching Wikipedia wikitext…");
  const wiki = await fetchWikitext();
  const parsed = parseRows(wiki);
  const matched = parsed.filter((p) => p.constituency_slug).length;
  console.error(`Parsed ${parsed.length} MP rows (${matched} with matched constituency slug).`);
  const rows = toSeedRows(parsed);
  writeFileSync(OUT, `${JSON.stringify(rows, null, 2)}\n`);
  console.error(`Wrote ${OUT} (${rows.length} MPs).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
