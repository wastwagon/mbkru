#!/usr/bin/env node
/**
 * Fetch official MP portraits from parliament.gh and attach them to local
 * ParliamentMember rows via `portraitPath` / `externalSourceKey`.
 *
 * Source: https://www.parliament.gh/members (paginated public directory).
 * Photos are cached under `public/images/mps/` so production does not hotlink.
 * Unmatched members keep a null portraitPath — UI shows initials placeholders;
 * admins can upload replacements at /admin/parliament/[id] (stored under /uploads/mps/).
 *
 * Usage:
 *   node scripts/fetch-mp-portraits.mjs            # dry-run match report
 *   node scripts/fetch-mp-portraits.mjs --apply     # download + update DB
 *   node scripts/fetch-mp-portraits.mjs --apply --force
 *
 * Requires DATABASE_URL when using --apply.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "images", "mps");
const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");
const UA =
  "mbkru-website/1.0 (civic accountability roster; contact info@mbkruadvocates.org)";
const BASE = "https://www.parliament.gh";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normalizeName(raw) {
  return String(raw ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^(hon\.?\s*|rt\.?\s*hon\.?\s*)+/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nameTokens(raw) {
  return normalizeName(raw).split(" ").filter((t) => t.length > 1);
}

function tokenClose(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  // Cheap single-edit / adjacent-transposition tolerance for roster typos.
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 2) return false;
    if (i + 1 < a.length && j + 1 < b.length && a[i] === b[j + 1] && a[i + 1] === b[j]) {
      i += 2;
      j += 2;
      continue;
    }
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  edits += a.length - i + (b.length - j);
  return edits <= 2;
}

/** Score 0–1 how well parliament listing name matches a DB member name. */
function matchScore(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.92;
  const ta = nameTokens(a);
  const tb = nameTokens(b);
  if (ta.length === 0 || tb.length === 0) return 0;

  let softInter = 0;
  const usedB = new Set();
  for (const t of ta) {
    const hit = tb.findIndex((u, idx) => !usedB.has(idx) && tokenClose(t, u));
    if (hit >= 0) {
      usedB.add(hit);
      softInter += 1;
    }
  }
  const union = new Set([...ta, ...tb]).size;
  const coverage = softInter / Math.max(ta.length, tb.length);
  const jaccard = softInter / union;
  const lastA = ta.at(-1);
  const lastB = tb.at(-1);
  const surnameBonus = lastA && lastB && tokenClose(lastA, lastB) ? 0.18 : 0;
  // Reordered full names (A B C vs C A B) with shared tokens.
  const reorderBonus = coverage >= 0.8 && softInter >= 2 ? 0.12 : 0;
  return Math.min(1, Math.max(jaccard + surnameBonus, coverage + reorderBonus));
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

function parseListingPage(html) {
  const rows = [];
  const re =
    /cspics\/mps\/(\d+)\.jpg[\s\S]{0,900}?>(?:Hon\.?\s*)?([A-Za-z][A-Za-z0-9' .\-]{4,90}?)\s*<\/(?:h\d|div|span|p|a|strong)>/gi;
  let m;
  while ((m = re.exec(html))) {
    rows.push({
      parliamentId: m[1],
      name: m[2].replace(/\s+/g, " ").trim(),
      photoUrl: `${BASE}/cspics/mps/${m[1]}.jpg`,
    });
  }
  // Fallback: id + nearby Hon. name when markup drifts
  if (rows.length === 0) {
    const ids = [...html.matchAll(/members\?mp=(\d+)/g)].map((x) => x[1]);
    for (const id of [...new Set(ids)]) {
      const idx = html.indexOf(`members?mp=${id}`);
      const chunk = html.slice(Math.max(0, idx), idx + 1200);
      const nameMatch = chunk.match(/Hon\.?\s*([A-Za-z][A-Za-z0-9' .\-]{4,90})/i);
      if (nameMatch) {
        rows.push({
          parliamentId: id,
          name: nameMatch[1].replace(/\s+/g, " ").trim(),
          photoUrl: `${BASE}/cspics/mps/${id}.jpg`,
        });
      }
    }
  }
  return rows;
}

async function scrapeDirectory() {
  const all = new Map();
  for (let page = 1; page <= 12; page++) {
    const url = page === 1 ? `${BASE}/members` : `${BASE}/members?page=${page}`;
    const html = await fetchText(url);
    const rows = parseListingPage(html);
    console.log(`page ${page}: ${rows.length} portraits`);
    if (rows.length === 0 && page > 1) break;
    for (const row of rows) all.set(row.parliamentId, row);
    await sleep(400);
  }
  return [...all.values()];
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function downloadPortrait(row) {
  await mkdir(OUT_DIR, { recursive: true });
  const filename = `${row.parliamentId}.jpg`;
  const diskPath = path.join(OUT_DIR, filename);
  const publicPath = `/images/mps/${filename}`;
  if (!FORCE && (await exists(diskPath))) return publicPath;

  const res = await fetch(row.photoUrl, {
    headers: { "User-Agent": UA, Accept: "image/*" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`photo ${row.parliamentId} → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2_000) throw new Error(`photo ${row.parliamentId} too small`);
  await writeFile(diskPath, buf);
  return publicPath;
}

async function main() {
  console.log(`Scraping parliament.gh member directory…`);
  const directory = await scrapeDirectory();
  console.log(`Directory portraits found: ${directory.length}`);

  const prisma = new PrismaClient();
  try {
    const members = await prisma.parliamentMember.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true, portraitPath: true, externalSourceKey: true },
      orderBy: { name: "asc" },
    });
    console.log(`Active local MPs: ${members.length}`);

    const usedParliamentIds = new Set();
    const matches = [];
    const unmatchedLocal = [];

    for (const member of members) {
      let best = null;
      let bestScore = 0;
      for (const row of directory) {
        if (usedParliamentIds.has(row.parliamentId)) continue;
        const score = matchScore(member.name, row.name);
        if (score > bestScore) {
          bestScore = score;
          best = row;
        }
      }
      if (best && bestScore >= 0.68) {
        usedParliamentIds.add(best.parliamentId);
        matches.push({ member, row: best, score: bestScore });
      } else {
        unmatchedLocal.push({ member, best, bestScore });
      }
    }

    console.log(`Matched ≥0.68: ${matches.length}`);
    console.log(`Unmatched (placeholder): ${unmatchedLocal.length}`);
    for (const u of unmatchedLocal.slice(0, 15)) {
      console.log(
        `  miss ${u.member.name} ← best ${u.best?.name ?? "—"} (${(u.bestScore ?? 0).toFixed(2)})`,
      );
    }

    if (!APPLY) {
      console.log(`\nDry-run only. Re-run with --apply to download and update the database.`);
      return;
    }

    let updated = 0;
    let failed = 0;
    for (const { member, row, score } of matches) {
      try {
        const portraitPath = await downloadPortrait(row);
        await prisma.parliamentMember.update({
          where: { id: member.id },
          data: {
            portraitPath,
            externalSourceKey: `parliament.gh:${row.parliamentId}`,
          },
        });
        updated += 1;
        console.log(`ok ${member.name} ← ${row.name} [${score.toFixed(2)}] → ${portraitPath}`);
        await sleep(150);
      } catch (err) {
        failed += 1;
        console.error(`FAIL ${member.name}: ${err.message}`);
      }
    }
    console.log(`\nUpdated ${updated}; download failures ${failed}; placeholders ${unmatchedLocal.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
