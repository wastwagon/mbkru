import credits from "@/lib/regions/sector-image-credits.json";

/**
 * Bundled default photographs for regional "Key sectors" galleries.
 * Sourced from Wikimedia Commons (public domain / CC BY / CC BY-SA) by
 * `scripts/fetch-region-sector-images.mjs`; admins can replace them per
 * region via the CMS gallery, which overrides these defaults.
 */

export type RegionGalleryImage = {
  src: string;
  alt: string;
  label: string;
  credit?: string;
};

type SectorCredit = {
  file: string;
  sourceUrl: string;
  author: string;
  license: string;
};

const SECTOR_CREDITS = credits as Record<string, SectorCredit>;

/** Normalized sector label → bundled image key. */
const LABEL_TO_KEY: Record<string, string> = {
  agriculture: "agriculture",
  cocoa: "cocoa",
  shea: "shea",
  livestock: "livestock",
  fishing: "fishing",
  fisheries: "fishing",
  tourism: "tourism",
  mining: "mining",
  "oil & gas": "oil-gas",
  timber: "timber",
  commerce: "commerce",
  manufacturing: "manufacturing",
  services: "services",
  finance: "finance",
  government: "government",
  transport: "transport",
  crafts: "crafts",
  "volta basin": "volta-basin",
};

/** Split a `keySectors` display string ("Oil & Gas, Timber, Mining") into labels. */
export function parseKeySectors(keySectors: string | undefined): string[] {
  if (!keySectors) return [];
  return keySectors
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function sectorImageKey(label: string): string | null {
  return LABEL_TO_KEY[label.toLowerCase()] ?? null;
}

/**
 * Default gallery for a region — one bundled photograph per mapped key sector.
 * Sectors without a bundled image are skipped (gallery hides when empty).
 */
export function defaultSectorGallery(regionName: string, keySectors: string | undefined): RegionGalleryImage[] {
  const seen = new Set<string>();
  const images: RegionGalleryImage[] = [];
  for (const label of parseKeySectors(keySectors)) {
    const key = sectorImageKey(label);
    if (!key || seen.has(key)) continue;
    const credit = SECTOR_CREDITS[key];
    if (!credit) continue;
    seen.add(key);
    images.push({
      src: credit.file,
      alt: `${label} — a key sector of ${regionName} Region, Ghana`,
      label,
      credit: `${credit.author} · ${credit.license} · Wikimedia Commons`,
    });
  }
  return images;
}
