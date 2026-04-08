import { describe, expect, it } from "vitest";

import {
  parsePromiseListSearchQuery,
  parsePromiseListSectorFilter,
  parsePromiseListStatusFilter,
} from "./promise-list-filters";

describe("promise-list-filters", () => {
  it("parses valid status", () => {
    expect(parsePromiseListStatusFilter("in_progress")).toBe("IN_PROGRESS");
  });

  it("rejects invalid status", () => {
    expect(parsePromiseListStatusFilter("MET")).toBeUndefined();
    expect(parsePromiseListStatusFilter("")).toBeUndefined();
  });

  it("parses valid sector", () => {
    expect(parsePromiseListSectorFilter("fiscal")).toBe("FISCAL");
  });

  it("rejects invalid sector", () => {
    expect(parsePromiseListSectorFilter("imf")).toBeUndefined();
  });

  it("trims search query", () => {
    expect(parsePromiseListSearchQuery("  roads  ")).toBe("roads");
  });
});
