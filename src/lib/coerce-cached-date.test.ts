import { describe, expect, it } from "vitest";

import { coerceCachedDate } from "./coerce-cached-date";

describe("coerceCachedDate", () => {
  it("returns null for empty values", () => {
    expect(coerceCachedDate(null)).toBeNull();
    expect(coerceCachedDate(undefined)).toBeNull();
  });

  it("passes through valid Date instances", () => {
    const d = new Date("2026-06-05T17:57:54.584Z");
    expect(coerceCachedDate(d)?.toISOString()).toBe(d.toISOString());
  });

  it("revives ISO strings from unstable_cache round-trips", () => {
    const iso = "2026-06-05T17:57:54.584Z";
    expect(coerceCachedDate(iso)?.toISOString()).toBe(iso);
  });

  it("returns null for invalid strings", () => {
    expect(coerceCachedDate("not-a-date")).toBeNull();
  });
});
