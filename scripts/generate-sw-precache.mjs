#!/usr/bin/env node
/**
 * Post-build: emit public/sw-precache.json from Next build artifacts so the service
 * worker can precache hashed JS/CSS for the current deployment.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BUILD_ID_PATH = path.join(ROOT, ".next/BUILD_ID");
const MANIFEST_PATH = path.join(ROOT, ".next/build-manifest.json");
const STATIC_DIR = path.join(ROOT, ".next/static");
const OUT_PATH = path.join(ROOT, "public/sw-precache.json");

function die(msg) {
  console.error(`generate-sw-precache: ${msg}`);
  process.exit(1);
}

function walkStaticFiles(dir, urlPrefix, out) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkStaticFiles(abs, `${urlPrefix}/${ent.name}`, out);
    } else if (/\.(css|js|woff2)$/.test(ent.name)) {
      out.add(`${urlPrefix}/${ent.name}`);
    }
  }
}

if (!fs.existsSync(BUILD_ID_PATH)) {
  die("missing .next/BUILD_ID — run next build first");
}
if (!fs.existsSync(MANIFEST_PATH)) {
  die("missing .next/build-manifest.json — run next build first");
}

const buildId = fs.readFileSync(BUILD_ID_PATH, "utf8").trim();
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

const urls = new Set();

for (const key of ["polyfillFiles", "rootMainFiles", "lowPriorityFiles"]) {
  const files = manifest[key];
  if (!Array.isArray(files)) continue;
  for (const file of files) {
    if (typeof file === "string" && file.startsWith("static/")) {
      urls.add(`/_next/${file}`);
    }
  }
}

walkStaticFiles(STATIC_DIR, "/_next/static", urls);

const payload = {
  buildId,
  generatedAt: new Date().toISOString(),
  urls: [...urls].sort(),
};

fs.writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`generate-sw-precache: ${payload.urls.length} assets for build ${buildId}`);
