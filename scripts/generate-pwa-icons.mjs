/**
 * Generates minimal PNG icons for PWA manifest (teal brand square + gold accent).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function png(size, draw) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y, size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const compressed = zlib.deflateSync(raw);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function brandPixel(x, y, size, maskable = false) {
  const pad = maskable ? Math.floor(size * 0.1) : 0;
  const inner = size - pad * 2;
  const rx = x - pad;
  const ry = y - pad;
  if (rx < 0 || ry < 0 || rx >= inner || ry >= inner) return [0, 0, 0, 0];
  const radius = inner * 0.18;
  const inRound =
    rx >= radius &&
    ry >= radius &&
    rx <= inner - radius &&
    ry <= inner - radius
      ? true
      : (rx < radius && ry < radius && (rx - radius) ** 2 + (ry - radius) ** 2 <= radius ** 2) ||
        (rx > inner - radius && ry < radius && (rx - (inner - radius)) ** 2 + (ry - radius) ** 2 <= radius ** 2) ||
        (rx < radius && ry > inner - radius && (rx - radius) ** 2 + (ry - (inner - radius)) ** 2 <= radius ** 2) ||
        (rx > inner - radius &&
          ry > inner - radius &&
          (rx - (inner - radius)) ** 2 + (ry - (inner - radius)) ** 2 <= radius ** 2);

  if (!inRound) return [0, 0, 0, 0];

  const goldBand = ry > inner * 0.38 && ry < inner * 0.48;
  if (goldBand) return [233, 185, 73, 255];
  return [13, 148, 136, 255];
}

for (const [name, size, maskable] of [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-maskable-512.png", 512, true],
]) {
  writeFileSync(join(outDir, name), png(size, (x, y, s) => brandPixel(x, y, s, maskable)));
}

console.log("Wrote PWA icons to public/icons/");
