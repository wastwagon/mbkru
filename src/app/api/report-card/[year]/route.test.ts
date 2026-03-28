import { beforeEach, describe, expect, it, vi } from "vitest";

const platformPhase = { value: 3 as 1 | 2 | 3 };
const dbConfigured = { value: true };

vi.mock("@/config/platform", () => ({
  getServerPlatformPhase: () => platformPhase.value,
  platformFeatures: {
    accountabilityScorecards: (p: number) => p >= 3,
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: () => dbConfigured.value,
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/server/accountability-cache", () => ({
  accountabilityApiNotFoundCacheControl: () => "public, max-age=60",
  accountabilityPublicCacheControl: () => "public, max-age=120",
  getCachedReportCardApiPayload: vi.fn(),
}));

import { GET } from "./route";
import { getCachedReportCardApiPayload } from "@/lib/server/accountability-cache";

function ctx(year: string) {
  return { params: Promise.resolve({ year }) };
}

describe("GET /api/report-card/[year]", () => {
  beforeEach(() => {
    platformPhase.value = 3;
    dbConfigured.value = true;
    vi.mocked(getCachedReportCardApiPayload).mockReset();
  });

  it("returns 404 when scorecards feature is off", async () => {
    platformPhase.value = 2;
    const res = await GET(new Request("https://example.com/api/report-card/2028"), ctx("2028"));
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid year", async () => {
    const res = await GET(new Request("https://example.com/api/report-card/bad"), ctx("bad"));
    expect(res.status).toBe(400);
  });

  it("returns 404 with not-found cache header when cycle missing", async () => {
    vi.mocked(getCachedReportCardApiPayload).mockResolvedValue(null);
    const res = await GET(new Request("https://example.com/api/report-card/2099"), ctx("2099"));
    expect(res.status).toBe(404);
    expect(res.headers.get("Cache-Control")).toBeTruthy();
    const json = await res.json();
    expect(json.error).toBe("Not found");
  });

  it("returns payload and public cache header when published", async () => {
    vi.mocked(getCachedReportCardApiPayload).mockResolvedValue({
      year: 2099,
      label: "Demo",
      publishedAt: "2026-03-28T00:00:00.000Z",
      methodology: null,
      entries: [],
    });
    const res = await GET(new Request("https://example.com/api/report-card/2099"), ctx("2099"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("public");
    const json = await res.json();
    expect(json.year).toBe(2099);
    expect(json.entries).toEqual([]);
  });
});
