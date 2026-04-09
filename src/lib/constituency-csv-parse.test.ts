import { describe, expect, it } from "vitest";

import { parseConstituenciesCsv } from "./constituency-csv-parse";

describe("parseConstituenciesCsv", () => {
  it("parses valid rows", () => {
    const csv = ["name,slug,region_slug,code", "Accra Central,accra-central,greater-accra,C01"].join("\n");
    const r = parseConstituenciesCsv(csv);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.rows).toHaveLength(1);
      expect(r.rows[0]!.slug).toBe("accra-central");
      expect(r.rows[0]!.region_slug).toBe("greater-accra");
      expect(r.rows[0]!.code).toBe("C01");
    }
  });

  it("allows empty code", () => {
    const csv = ["name,slug,region_slug,code", "Kumasi,kumasi,ashanti,"].join("\n");
    const r = parseConstituenciesCsv(csv);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.rows[0]!.code).toBeUndefined();
    }
  });
});
