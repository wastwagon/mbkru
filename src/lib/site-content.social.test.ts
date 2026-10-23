import { describe, expect, it } from "vitest";

import { content, getPublicSocialLinks, getTopBarSocialLinks } from "@/lib/site-content";

describe("developerCredit", () => {
  it("points to OceanCyber with name-only link label", () => {
    expect(content.developerCredit.lead).toMatch(/Designed/i);
    expect(content.developerCredit.href).toBe("https://oceancyber.net/");
    expect(content.developerCredit.name).toBe("OceanCyber");
  });
});

describe("getPublicSocialLinks", () => {
  it("falls back to /contact when coded URLs are placeholders", () => {
    const links = getPublicSocialLinks();
    expect(links).toHaveLength(3);
    for (const link of links) {
      expect(link.external).toBe(false);
      expect(link.href).toBe("/contact");
    }
  });

  it("matches deprecated getTopBarSocialLinks alias", () => {
    expect(getTopBarSocialLinks()).toEqual(getPublicSocialLinks());
  });
});
