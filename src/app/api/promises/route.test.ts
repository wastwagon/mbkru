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
  accountabilityPublicCacheControl: () => "public, max-age=60",
  getCachedPromisesApiRows: vi.fn(),
}));

import { GET } from "./route";
import { getCachedPromisesApiRows } from "@/lib/server/accountability-cache";

describe("GET /api/promises", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    dbConfigured.value = true;
    vi.mocked(getCachedPromisesApiRows).mockReset();
    vi.mocked(getCachedPromisesApiRows).mockResolvedValue([]);
  });

  it("returns 404 when parliament tracker feature is off", async () => {
    platformPhase.value = 1;
    const res = await GET(new Request("https://example.com/api/promises"));
    expect(res.status).toBe(404);
  });

  it("passes normalized memberSlug to cache loader", async () => {
    await GET(new Request("https://example.com/api/promises?memberSlug=Jane-Doe"));
    expect(getCachedPromisesApiRows).toHaveBeenCalledWith("jane-doe");
  });

  it("returns promises array and cache header", async () => {
    vi.mocked(getCachedPromisesApiRows).mockResolvedValue([
      {
        id: "p1",
        title: "Demo",
        description: null,
        sourceLabel: "seed",
        sourceDate: null,
        status: "TRACKING",
        updatedAt: "2026-03-28T00:00:00.000Z",
        member: { name: "A", slug: "a", role: "MP", party: null },
      },
    ]);
    const res = await GET(new Request("https://example.com/api/promises"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("public");
    const json = await res.json();
    expect(json.promises).toHaveLength(1);
    expect(json.promises[0].title).toBe("Demo");
  });
});
