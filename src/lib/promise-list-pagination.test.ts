import { describe, expect, it } from "vitest";

import { buildPromiseListPageHref, parsePromiseListPageIndex } from "./promise-list-pagination";

describe("promise-list-pagination", () => {
  it("parsePromiseListPageIndex defaults and clamps", () => {
    expect(parsePromiseListPageIndex(undefined)).toBe(1);
    expect(parsePromiseListPageIndex("")).toBe(1);
    expect(parsePromiseListPageIndex("0")).toBe(1);
    expect(parsePromiseListPageIndex("-3")).toBe(1);
    expect(parsePromiseListPageIndex("abc")).toBe(1);
    expect(parsePromiseListPageIndex("2")).toBe(2);
    expect(parsePromiseListPageIndex("500")).toBe(500);
    expect(parsePromiseListPageIndex("501")).toBe(500);
    expect(parsePromiseListPageIndex("9999")).toBe(500);
  });

  it("buildPromiseListPageHref omits page 1 and empty params", () => {
    expect(
      buildPromiseListPageHref("/government-commitments", {
        q: "",
        sector: undefined,
        status: undefined,
        page: 1,
      }),
    ).toBe("/government-commitments");
  });

  it("buildPromiseListPageHref preserves filters and page", () => {
    expect(
      buildPromiseListPageHref("/promises/browse", {
        q: "roads",
        sector: "FISCAL",
        status: "IN_PROGRESS",
        governmentOnly: true,
        page: 3,
      }),
    ).toBe("/promises/browse?q=roads&sector=FISCAL&status=IN_PROGRESS&governmentOnly=1&page=3");
  });

  it("buildPromiseListPageHref omits governmentOnly when false", () => {
    expect(
      buildPromiseListPageHref("/promises/browse", {
        q: "",
        sector: undefined,
        status: undefined,
        governmentOnly: false,
        page: 2,
      }),
    ).toBe("/promises/browse?page=2");
  });

  it("buildPromiseListPageHref includes constituency when set", () => {
    expect(
      buildPromiseListPageHref("/promises/browse", {
        q: "",
        sector: undefined,
        status: undefined,
        governmentOnly: false,
        constituency: "abetifi",
        page: 1,
      }),
    ).toBe("/promises/browse?constituency=abetifi");
  });
});
