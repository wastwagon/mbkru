import { describe, expect, it } from "vitest";

import { parseParliamentMembersCsv, splitCsvLine } from "./parliament-csv-parse";

const validHeader = "name,slug,role,party,constituency_slug,active";

describe("splitCsvLine", () => {
  it("splits simple commas", () => {
    expect(splitCsvLine("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("handles quoted commas", () => {
    expect(splitCsvLine('"Accra, North",slug-mp,MP,,,true')).toEqual([
      "Accra, North",
      "slug-mp",
      "MP",
      "",
      "",
      "true",
    ]);
  });

  it("handles escaped quotes", () => {
    expect(splitCsvLine('"Say ""hello""",x,MP,,,true')).toEqual(['Say "hello"', "x", "MP", "", "", "true"]);
  });
});

describe("parseParliamentMembersCsv", () => {
  it("rejects missing data rows", () => {
    const r = parseParliamentMembersCsv(validHeader);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/header row and at least one data row/);
  });

  it("rejects wrong header order", () => {
    const r = parseParliamentMembersCsv("slug,name,role,party,constituency_slug,active\nx,y,MP,,,true");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Column 1/);
  });

  it("parses minimal row with empty party and constituency", () => {
    const csv = `${validHeader}\nJane Doe,jane-doe,MP,,,true`;
    const r = parseParliamentMembersCsv(csv);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0]).toMatchObject({
      name: "Jane Doe",
      slug: "jane-doe",
      role: "MP",
      party: undefined,
      constituency_slug: undefined,
      active: true,
    });
  });

  it("normalizes slug and treats active false", () => {
    const csv = `${validHeader}\nTest User,Test User Slug!,MP,NDC,some-ward,no`;
    const r = parseParliamentMembersCsv(csv);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rows[0].slug).toBe("test-user-slug");
    expect(r.rows[0].constituency_slug).toBe("some-ward");
    expect(r.rows[0].active).toBe(false);
  });

  it("rejects too few columns on a data line", () => {
    const csv = `${validHeader}\nOnly,Two`;
    const r = parseParliamentMembersCsv(csv);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/not enough columns/);
  });
});
