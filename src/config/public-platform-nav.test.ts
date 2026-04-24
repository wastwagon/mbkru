import { describe, expect, it } from "vitest";

import {
  getFooterLegalLinks,
  getFooterOrganizationLinks,
  getPublicSitemapStaticPaths,
} from "./public-platform-nav";

describe("public-platform-nav footer ↔ sitemap", () => {
  it("legal footer links are included in static sitemap paths for phase 2", () => {
    const sitemap = new Set(getPublicSitemapStaticPaths(2));
    for (const { href } of getFooterLegalLinks()) {
      expect(sitemap.has(href), `${href} should be in sitemap`).toBe(true);
    }
  });

  it("useful-links footer hrefs are included in static sitemap paths for phase 2", () => {
    const sitemap = new Set(getPublicSitemapStaticPaths(2));
    for (const { href } of getFooterOrganizationLinks(2)) {
      expect(sitemap.has(href), `${href} should be in sitemap`).toBe(true);
    }
  });

  it("phase 1 organization links omit partner-api (not in sitemap for phase 1)", () => {
    const org = getFooterOrganizationLinks(1);
    expect(org.some((l) => l.href === "/partner-api")).toBe(false);
    expect(new Set(getPublicSitemapStaticPaths(1)).has("/partner-api")).toBe(false);
  });

  it("phase 2 organization links include partner-api after data sources", () => {
    const org = getFooterOrganizationLinks(2);
    const idxData = org.findIndex((l) => l.href === "/data-sources");
    const idxPartner = org.findIndex((l) => l.href === "/partner-api");
    expect(idxPartner).toBeGreaterThan(-1);
    expect(idxPartner).toBe(idxData + 1);
  });
});
