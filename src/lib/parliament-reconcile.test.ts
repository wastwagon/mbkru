import { describe, expect, it } from "vitest";

import { computeParliamentImportReconcile } from "./parliament-reconcile";
import type { ParsedParliamentRow } from "./parliament-csv-parse";

const map = new Map<string, string>([["accra-central", "c1"]]);

function row(p: Partial<ParsedParliamentRow> & Pick<ParsedParliamentRow, "slug" | "name">): ParsedParliamentRow {
  return {
    role: "MP",
    party: undefined,
    constituency_slug: undefined,
    active: true,
    ...p,
  };
}

describe("computeParliamentImportReconcile", () => {
  it("flags unknown constituency and skips that row for creates", () => {
    const res = computeParliamentImportReconcile(
      [row({ slug: "mp-a", name: "A", constituency_slug: "nope" })],
      [],
      map,
    );
    expect(res.rowErrors.some((e) => e.includes("unknown constituency_slug"))).toBe(true);
    expect(res.wouldCreate).toHaveLength(0);
    expect(res.summary.csvRowsValid).toBe(0);
  });

  it("wouldCreate when slug missing in DB", () => {
    const res = computeParliamentImportReconcile(
      [row({ slug: "new-mp", name: "New", role: "MP", constituency_slug: "accra-central" })],
      [],
      map,
    );
    expect(res.rowErrors).toHaveLength(0);
    expect(res.wouldCreate).toHaveLength(1);
    expect(res.wouldCreate[0]!.slug).toBe("new-mp");
  });

  it("wouldUpdate when fields differ", () => {
    const res = computeParliamentImportReconcile(
      [row({ slug: "mp-a", name: "Renamed", party: "NPP", active: false, constituency_slug: "accra-central" })],
      [
        {
          slug: "mp-a",
          name: "Old",
          role: "MP",
          party: null,
          constituencySlug: null,
          active: true,
        },
      ],
      map,
    );
    expect(res.wouldUpdate).toHaveLength(1);
    expect(res.wouldUpdate[0]!.changes.map((c) => c.field)).toEqual(
      expect.arrayContaining(["name", "party", "constituency_slug", "active"]),
    );
  });

  it("unchanged when identical semantics", () => {
    const res = computeParliamentImportReconcile(
      [row({ slug: "mp-a", name: "Same", role: "MP", party: undefined, active: true })],
      [
        {
          slug: "mp-a",
          name: "Same",
          role: "MP",
          party: null,
          constituencySlug: null,
          active: true,
        },
      ],
      map,
    );
    expect(res.unchangedSlugs).toEqual(["mp-a"]);
    expect(res.wouldUpdate).toHaveLength(0);
  });

  it("lists DB members absent from CSV", () => {
    const res = computeParliamentImportReconcile(
      [row({ slug: "only-csv", name: "X" })],
      [
        {
          slug: "only-csv",
          name: "X",
          role: "MP",
          party: null,
          constituencySlug: null,
          active: true,
        },
        {
          slug: "orphan",
          name: "Y",
          role: "MP",
          party: null,
          constituencySlug: null,
          active: true,
        },
      ],
      map,
    );
    expect(res.inDatabaseNotInCsv).toHaveLength(1);
    expect(res.inDatabaseNotInCsv[0]!.slug).toBe("orphan");
  });

  it("detects duplicate slugs in CSV", () => {
    const res = computeParliamentImportReconcile(
      [
        row({ slug: "dup", name: "First" }),
        row({ slug: "dup", name: "Second" }),
      ],
      [],
      map,
    );
    expect(res.rowErrors.some((e) => e.includes("duplicate slug"))).toBe(true);
    expect(res.summary.csvRowsValid).toBe(1);
  });
});
