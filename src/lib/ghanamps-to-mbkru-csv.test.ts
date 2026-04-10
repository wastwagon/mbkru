import { describe, expect, it } from "vitest";

import { ghanampsMembersToCsvText, listConstituencySlugsFromGhanampsJson, parseGhanampsMembersJson } from "./ghanamps-to-mbkru-csv";

describe("ghanamps-to-mbkru-csv", () => {
  it("converts array to CSV with header", () => {
    const csv = ghanampsMembersToCsvText([
      { name: "Ama Test", party: "NDC", constituency: "Abetifi" },
    ]);
    expect(csv.startsWith("name,slug,role,party,constituency_slug,active\n")).toBe(true);
    expect(csv).toContain("ama-test");
    expect(csv).toContain("abetifi");
  });

  it("dedupes slug suffix when same name pattern", () => {
    const csv = ghanampsMembersToCsvText([
      { name: "X Y", party: "A", constituency: "C1" },
      { name: "X Y", party: "B", constituency: "C2" },
    ]);
    expect(csv).toContain("x-y,");
    expect(csv).toContain("x-y-2,");
  });

  it("lists constituency slugs", () => {
    const slugs = listConstituencySlugsFromGhanampsJson([
      { name: "A", constituency: "Klottey Korle" },
    ]);
    expect(slugs).toEqual(["klottey-korle"]);
  });

  it("parse throws on non-array", () => {
    expect(() => parseGhanampsMembersJson({})).toThrow(/array/);
  });
});
