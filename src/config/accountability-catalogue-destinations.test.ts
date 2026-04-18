import { describe, expect, it } from "vitest";

import {
  pathnameIsPromisesBrowseAccountability,
  pathnameIsPromisesByMpAccountability,
} from "./accountability-catalogue-destinations";

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
