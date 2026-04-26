import { describe, expect, it } from "vitest";

import {
  accountabilityProse,
  methodologyKeyTerms,
  pathnameIsPromisesBrowseAccountability,
  pathnameIsPromisesByMpAccountability,
} from "./accountability-catalogue-destinations";

describe("parliament and home teaser copy", () => {
  it("exposes a stable page title and teaser caption for safe UI/UX", () => {
    expect(accountabilityProse.parliamentPageDocumentTitle).toBe("Parliament tracker");
    expect(accountabilityProse.browseHomeTeaserCaption(2, 5)).toContain("2 of 5");
  });
});

describe("methodologyKeyTerms", () => {
  it("has a stable public glossary for /methodology#key-terms", () => {
    expect(methodologyKeyTerms.length).toBeGreaterThanOrEqual(4);
    for (const row of methodologyKeyTerms) {
      expect(row.term.trim().length).toBeGreaterThan(0);
      expect(row.body.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("pathnameIsPromisesByMpAccountability", () => {
  it("treats roster index and member slug paths as the By MP surface", () => {
    expect(pathnameIsPromisesByMpAccountability("/promises")).toBe(true);
    expect(pathnameIsPromisesByMpAccountability("/promises/john-doe")).toBe(true);
  });

  it("excludes the browse subtree", () => {
    expect(pathnameIsPromisesByMpAccountability("/promises/browse")).toBe(false);
    expect(pathnameIsPromisesByMpAccountability("/promises/browse/extra")).toBe(false);
  });

  it("does not match unrelated paths", () => {
    expect(pathnameIsPromisesByMpAccountability("/parliament-tracker")).toBe(false);
    expect(pathnameIsPromisesByMpAccountability("/")).toBe(false);
  });
});

describe("pathnameIsPromisesBrowseAccountability", () => {
  it("matches browse and nested browse paths", () => {
    expect(pathnameIsPromisesBrowseAccountability("/promises/browse")).toBe(true);
    expect(pathnameIsPromisesBrowseAccountability("/promises/browse/")).toBe(true);
  });

  it("does not match the MP roster", () => {
    expect(pathnameIsPromisesBrowseAccountability("/promises")).toBe(false);
    expect(pathnameIsPromisesBrowseAccountability("/promises/mp-slug")).toBe(false);
  });
});
