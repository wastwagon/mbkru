import { beforeEach, describe, expect, it, vi } from "vitest";

const platformPhase = { value: 2 as 1 | 2 | 3 };
const dbConfigured = { value: true };

vi.mock("@/config/platform", () => ({
  getServerPlatformPhase: () => platformPhase.value,
  platformFeatures: {
    parliamentTrackerData: (p: number) => p >= 2,
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: () => dbConfigured.value,
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/server/accountability-cache", () => ({
  accountabilityPublicCacheControl: () => "public, max-age=60, s-maxage=60",
  getCachedMpsPublicRoster: vi.fn(),
}));

import { GET } from "./route";
import { getCachedMpsPublicRoster } from "@/lib/server/accountability-cache";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

describe("GET /api/mps", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    dbConfigured.value = true;
    vi.mocked(getCachedMpsPublicRoster).mockReset();
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
  });

  it("returns 404 when parliament data feature is off (phase 1)", async () => {
    platformPhase.value = 1;
    const res = await GET(new Request("https://example.com/api/mps"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Not available");
  });

  it("returns 503 when database is not configured", async () => {
    dbConfigured.value = false;
    const res = await GET(new Request("https://example.com/api/mps"));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toBe("Database not configured");
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const res = await GET(new Request("https://example.com/api/mps"));
    expect(res.status).toBe(429);
  });

  it("returns roster JSON and Cache-Control when allowed", async () => {
    vi.mocked(getCachedMpsPublicRoster).mockResolvedValue([
      {
        slug: "demo-mp",
        name: "Demo MP",
        role: "MP",
        party: null,
        constituencyName: null,
        promiseCount: 0,
      },
    ]);
    const res = await GET(new Request("https://example.com/api/mps"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("public");
    const json = await res.json();
    expect(json.members).toHaveLength(1);
    expect(json.members[0].slug).toBe("demo-mp");
  });
});
