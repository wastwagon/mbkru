/**
 * Regenerate favicon + PWA PNGs from public/icons/mbkru-brand-icon-source.png
 * (same artwork for browser tab, Apple touch, and install launcher).
 *
 * Requires macOS `sips`. Run: node scripts/generate-pwa-icons.mjs
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
const source = join(outDir, "mbkru-brand-icon-source.png");
const padColor = "E8ECEF";

if (!existsSync(source)) {
  console.error("Missing source image:", source);
  process.exit(1);
}

function sips(...args) {
  execSync(`sips ${args.join(" ")}`, { stdio: "inherit" });
}

const square = join(outDir, "_square-pad.png");
const maskPad = join(outDir, "_mask-pad.png");

const width = Number(
  execSync(`sips -g pixelWidth "${source}" | awk '/pixelWidth/{print $2}'`).toString().trim(),
);
const height = Number(
  execSync(`sips -g pixelHeight "${source}" | awk '/pixelHeight/{print $2}'`).toString().trim(),
);
const max = Math.max(width, height);

sips(`-p ${max} ${max}`, `"${source}"`, `--padColor ${padColor}`, `--out "${square}"`);

for (const [size, name] of [
  [512, "icon-512.png"],
  [192, "icon-192.png"],
  [180, "apple-touch-icon.png"],
  [32, "favicon-32.png"],
]) {
  const tmp = join(outDir, `_gen-${size}.png`);
  sips(`-z ${size} ${size}`, `"${square}"`, `--out "${tmp}"`);
  execSync(`mv "${tmp}" "${join(outDir, name)}"`);
}

const maskOuter = Math.round(max * 1.12);
sips(`-p ${maskOuter} ${maskOuter}`, `"${square}"`, `--padColor ${padColor}`, `--out "${maskPad}"`);
sips(`-z 512 512`, `"${maskPad}"`, `--out "${join(outDir, "icon-maskable-512.png")}"`);

execSync(`rm -f "${square}" "${maskPad}"`);

console.log("Wrote favicon + PWA icons from mbkru-brand-icon-source.png");
