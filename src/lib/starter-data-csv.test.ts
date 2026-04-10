import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { parseConstituenciesCsv } from "./constituency-csv-parse";
import { parseParliamentMembersCsv } from "./parliament-csv-parse";

const DATA_DIR = resolve(process.cwd(), "prisma/data");

describe("prisma/data starter CSVs (align with seed + CSV_IMPORT_RUNBOOK)", () => {
  it("constituencies.starter.csv parses", () => {
    const text = readFileSync(resolve(DATA_DIR, "constituencies.starter.csv"), "utf8");
    const r = parseConstituenciesCsv(text);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.rows).toHaveLength(3);
      expect(r.rows.map((x) => x.slug).sort()).toEqual(["abetifi", "bole-bamboi", "klottey-korle"]);
    }
  });

  it("parliament-members.starter.csv parses and constituency slugs exist in starter constituencies", () => {
    const ctext = readFileSync(resolve(DATA_DIR, "constituencies.starter.csv"), "utf8");
    const cr = parseConstituenciesCsv(ctext);
    expect(cr.ok).toBe(true);
    const cslugs = new Set(cr.ok ? cr.rows.map((x) => x.slug) : []);

    const mtext = readFileSync(resolve(DATA_DIR, "parliament-members.starter.csv"), "utf8");
    const mr = parseParliamentMembersCsv(mtext);
    expect(mr.ok).toBe(true);
    if (mr.ok) {
      expect(mr.rows).toHaveLength(3);
      for (const row of mr.rows) {
        if (row.constituency_slug) expect(cslugs.has(row.constituency_slug)).toBe(true);
      }
      expect(mr.rows.map((x) => x.slug).sort()).toEqual([
        "bryan-acheampong",
        "john-dramani-mahama",
        "zanetor-agyeman-rawlings",
      ]);
    }
  });
});
