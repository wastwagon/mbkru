import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const path = join(root, "prisma/data/parliament-members.seed.json");

describe("prisma/data/parliament-members.seed.json", () => {
  it("has a full-roster-sized list with valid rows", () => {
    const rows = JSON.parse(readFileSync(path, "utf8")) as unknown;
    expect(Array.isArray(rows)).toBe(true);
    expect((rows as unknown[]).length).toBeGreaterThanOrEqual(270);
    for (const r of (rows as Record<string, unknown>[]).slice(0, 5)) {
      expect(typeof r.name).toBe("string");
      expect(typeof r.slug).toBe("string");
      expect(r.role).toBe("MP");
      expect(r.active).toBe(true);
    }
  });
});
