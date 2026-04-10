import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const path = join(root, "prisma/data/communities.seed.json");

describe("prisma/data/communities.seed.json", () => {
  it("parses and has required fields for each row", () => {
    const rows = JSON.parse(readFileSync(path, "utf8")) as unknown;
    expect(Array.isArray(rows)).toBe(true);
    expect((rows as unknown[]).length).toBeGreaterThan(0);
    for (const r of rows as Record<string, unknown>[]) {
      expect(typeof r.slug).toBe("string");
      expect(typeof r.name).toBe("string");
      expect(typeof r.description).toBe("string");
      expect(typeof r.region_slug).toBe("string");
      expect(["OPEN", "APPROVAL_REQUIRED"]).toContain(r.joinPolicy);
      expect(["PUBLIC", "MEMBERS_ONLY"]).toContain(r.visibility);
      expect(["DRAFT", "ACTIVE", "ARCHIVED"]).toContain(r.status);
    }
  });
});
