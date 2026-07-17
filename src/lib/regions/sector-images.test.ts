import { describe, expect, it } from "vitest";

import { ghanaRegionsData } from "@/lib/site-content";
import { defaultSectorGallery, parseKeySectors, sectorImageKey } from "@/lib/regions/sector-images";

describe("parseKeySectors", () => {
  it("splits and trims comma-separated labels", () => {
    expect(parseKeySectors("Oil & Gas, Timber, Mining")).toEqual(["Oil & Gas", "Timber", "Mining"]);
  });

  it("returns empty for undefined", () => {
    expect(parseKeySectors(undefined)).toEqual([]);
  });
});

describe("sectorImageKey", () => {
  it("maps labels case-insensitively", () => {
    expect(sectorImageKey("Fisheries")).toBe("fishing");
    expect(sectorImageKey("oil & gas")).toBe("oil-gas");
    expect(sectorImageKey("Volta Basin")).toBe("volta-basin");
  });

  it("returns null for unknown labels", () => {
    expect(sectorImageKey("Astronomy")).toBeNull();
  });
});

describe("defaultSectorGallery", () => {
  it("every ghanaRegionsData key sector maps to a bundled image key", () => {
    for (const region of ghanaRegionsData) {
      for (const label of parseKeySectors(region.keySectors)) {
        expect(sectorImageKey(label), `unmapped sector "${label}" in ${region.name}`).not.toBeNull();
      }
    }
  });

  it("builds deduplicated entries with region-specific alt text", () => {
    const gallery = defaultSectorGallery("Upper West", "Agriculture, Shea, Livestock, Shea");
    const labels = gallery.map((g) => g.label);
    expect(new Set(labels).size).toBe(labels.length);
    for (const img of gallery) {
      expect(img.alt).toContain("Upper West");
      expect(img.src).toMatch(/^\/images\/sectors\//);
    }
  });
});
