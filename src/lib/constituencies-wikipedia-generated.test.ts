import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { parseConstituenciesCsv } from "./constituency-csv-parse";

const GENERATED = resolve(process.cwd(), "prisma/data/generated/constituencies.wikipedia.csv");

describe("prisma/data/generated/constituencies.wikipedia.csv", () => {
  it.skipIf(!existsSync(GENERATED))("parses and has expected scale", () => {
    const r = parseConstituenciesCsv(readFileSync(GENERATED, "utf8"));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.rows.length).toBeGreaterThanOrEqual(260);
      expect(r.rows.some((x) => x.slug === "abetifi")).toBe(true);
    }
  });
});
