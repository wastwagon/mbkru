import { describe, expect, it } from "vitest";

import {
  defaultPromisesApiFilters,
  parsePromisesApiFilters,
  promisesFiltersNarrowCatalogue,
} from "./promises-api-filters";

describe("defaultPromisesApiFilters", () => {
  it("matches empty URL parse", () => {
    expect(defaultPromisesApiFilters()).toEqual(parsePromisesApiFilters(new URL("http://local/")));
  });
});

describe("promisesFiltersNarrowCatalogue", () => {
  const base = defaultPromisesApiFilters();

  it("returns false for browse when nothing set", () => {
    expect(promisesFiltersNarrowCatalogue(base, "browse")).toBe(false);
  });

  it("returns false for government default slice (gov-only URL)", () => {
    const gov = parsePromisesApiFilters(new URL("http://local/?governmentOnly=1"));
    expect(promisesFiltersNarrowCatalogue(gov, "government")).toBe(false);
  });

  it("detects browse government toggle", () => {
    expect(promisesFiltersNarrowCatalogue({ ...base, governmentOnly: true }, "browse")).toBe(true);
  });

  it("detects sector on government page", () => {
    const f = parsePromisesApiFilters(new URL("http://local/?governmentOnly=1&policySector=FISCAL"));
    expect(promisesFiltersNarrowCatalogue(f, "government")).toBe(true);
  });
});
