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
  getCachedPromiseTrackerStats: vi.fn(),
}));

import { GET } from "./route";
import { getCachedPromiseTrackerStats } from "@/lib/server/accountability-cache";

describe("GET /api/accountability/promise-tracker-stats", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    dbConfigured.value = true;
    vi.mocked(getCachedPromiseTrackerStats).mockReset();
    vi.mocked(getCachedPromiseTrackerStats).mockResolvedValue({
      scope: "government",
      totalPromises: 3,
      governmentPromises: 3,
      mpsWithPromises: 2,
      activeMpsTotal: 10,
      publishedReportCardCycles: 0,
      reportCardEntriesPublished: 0,
      byStatus: { TRACKING: 3 },
      topPolicySectors: [],
    });
  });

  it("returns 404 when parliament tracker feature is off", async () => {
    platformPhase.value = 1;
    const res = await GET(new Request("https://example.com/api/accountability/promise-tracker-stats"));
    expect(res.status).toBe(404);
  });

  it("returns stats payload", async () => {
    const res = await GET(
      new Request("https://example.com/api/accountability/promise-tracker-stats?governmentOnly=1"),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.stats.totalPromises).toBe(3);
    expect(getCachedPromiseTrackerStats).toHaveBeenCalled();
  });
});
