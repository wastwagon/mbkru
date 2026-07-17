#!/usr/bin/env node
/**
 * Fetch openly licensed sector photographs from Wikimedia Commons into
 * `public/images/sectors/` and write a credits manifest consumed by
 * `src/lib/regions/sector-images.ts`.
 *
 * Usage: node scripts/fetch-region-sector-images.mjs [--force]
 *
 * Only public-domain / CC BY / CC BY-SA files are accepted (no NC/ND).
 * Admins can replace any of these via /admin/regions → gallery.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/images/sectors");
const CREDITS_PATH = path.join(__dirname, "../src/lib/regions/sector-image-credits.json");
const FORCE = process.argv.includes("--force");

/** Sector key → Commons search query (Ghana-specific where feasible). */
const SECTORS = {
  agriculture: "maize farm Ghana",
  cocoa: "cocoa pods farm Ghana",
  shea: "shea butter production Ghana",
  livestock: "cattle herd Ghana",
  fishing: "fishing boats Elmina Ghana",
  tourism: "Cape Coast Castle Ghana",
  mining: "gold mining Ghana",
  "oil-gas": "offshore oil platform",
  timber: "timber logs stacked forestry",
  commerce: "Makola market Accra",
  manufacturing: "factory workers Ghana",
  services: "Accra skyline",
  finance: "Bank of Ghana Accra",
  government: "Parliament House Accra Ghana",
  transport: "trotro station Accra",
  crafts: "kente weaving Ghana",
  "volta-basin": "Lake Volta Ghana",
};

const OK_LICENSE = /^(public domain|pd|cc0|cc by(-sa)? \d|attribution)/i;

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Commons rate-limits bursts hard (429) — throttle and retry with backoff. */
async function politeFetch(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, {
      headers: { "User-Agent": "mbkru-website-build/1.0 (contact: info@mbkruadvocates.org)" },
    });
    if (res.status !== 429) return res;
    await sleep(15_000 * (attempt + 1));
  }
  throw new Error("rate limited after retries");
}

async function api(params) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  for (const [k, v] of Object.entries({ format: "json", origin: "*", ...params })) {
    url.searchParams.set(k, String(v));
  }
  const res = await politeFetch(url);
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

function pickCandidate(pages) {
  const sorted = Object.values(pages ?? {}).sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
  for (const page of sorted) {
    const info = page.imageinfo?.[0];
    if (!info) continue;
    if (info.mime !== "image/jpeg" && info.mime !== "image/png") continue;
    if ((info.width ?? 0) < 1000 || (info.height ?? 0) < 550) continue;
    const meta = info.extmetadata ?? {};
    const license = meta.LicenseShortName?.value ?? "";
    if (!OK_LICENSE.test(license)) continue;
    return { page, info, license, meta };
  }
  return null;
}

async function fetchSector(key, query) {
  const data = await api({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: 6,
    gsrlimit: 12,
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: 1600,
  });
  const candidate = pickCandidate(data.query?.pages);
  if (!candidate) throw new Error(`no openly licensed candidate for "${query}"`);

  const { page, info, license, meta } = candidate;
  const src = info.thumburl ?? info.url;
  const res = await politeFetch(src);
  if (!res.ok) throw new Error(`download failed ${res.status} for ${src}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filePath = path.join(OUT_DIR, `${key}.jpg`);
  await writeFile(filePath, buffer);

  const author = (meta.Artist?.value ?? "").replace(/<[^>]+>/g, "").trim() || "Unknown author";
  return {
    file: `/images/sectors/${key}.jpg`,
    commonsTitle: page.title,
    sourceUrl: info.descriptionurl,
    author,
    license,
    bytes: buffer.length,
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const credits = {};
  const failures = [];
  for (const [key, query] of Object.entries(SECTORS)) {
    const filePath = path.join(OUT_DIR, `${key}.jpg`);
    if (!FORCE && (await exists(filePath))) {
      console.log(`skip ${key} (exists)`);
      continue;
    }
    try {
      credits[key] = await fetchSector(key, query);
      console.log(`ok   ${key} ← ${credits[key].commonsTitle} [${credits[key].license}]`);
    } catch (err) {
      failures.push(key);
      console.error(`FAIL ${key}: ${err.message}`);
    }
    await sleep(4000);
  }

  if (Object.keys(credits).length > 0) {
    let existing = {};
    try {
      existing = (await import(CREDITS_PATH, { with: { type: "json" } })).default;
    } catch {
      /* first run */
    }
    const merged = { ...existing, ...credits };
    await writeFile(CREDITS_PATH, `${JSON.stringify(merged, null, 2)}\n`);
    console.log(`credits → ${CREDITS_PATH}`);
  }
  if (failures.length > 0) {
    console.error(`\nFailed sectors: ${failures.join(", ")} — adjust queries and re-run.`);
    process.exitCode = 1;
  }
}

main();
