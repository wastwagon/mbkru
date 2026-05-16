import { beforeEach, describe, expect, it, vi } from "vitest";

const platformPhase = { value: 3 as 1 | 2 | 3 };
const dbConfigured = { value: true };

vi.mock("@/config/platform", () => ({
  getServerPlatformPhase: () => platformPhase.value,
  platformFeatures: {
    publicReportCard: (p: number) => p >= 2,
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

  it("returns 404 when public report card is off (Phase 1)", async () => {
    platformPhase.value = 1;
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
      parliamentTerm: { startYear: 2024, generalElectionYear: 2028 },
      publishedAt: "2026-03-28T00:00:00.000Z",
      methodology: null,
      disputeWindowEndsAt: null,
      pagination: {
        page: 1,
        pageSize: 150,
        totalEntries: 0,
        totalPages: 1,
        sort: "memberNameAsc",
      },
      entries: [],
    });
    const res = await GET(new Request("https://example.com/api/report-card/2099"), ctx("2099"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("public");
    const json = await res.json();
    expect(json.year).toBe(2099);
    expect(json.parliamentTerm).toEqual({ startYear: 2024, generalElectionYear: 2028 });
    expect(json.entries).toEqual([]);
    expect(json.pagination?.totalEntries).toBe(0);
  });

  it("redacts triple-index fields in partner JSON when Phase 2 (no flagship)", async () => {
    platformPhase.value = 2;
    vi.mocked(getCachedReportCardApiPayload).mockResolvedValue({
      year: 2099,
      label: "Demo",
      parliamentTerm: { startYear: 2024, generalElectionYear: 2028 },
      publishedAt: "2026-03-28T00:00:00.000Z",
      methodology: null,
      disputeWindowEndsAt: "2026-04-01T00:00:00.000Z",
      pagination: {
        page: 1,
        pageSize: 150,
        totalEntries: 1,
        totalPages: 1,
        sort: "memberNameAsc",
      },
      entries: [
        {
          member: { name: "Test MP", slug: "test-mp", role: "MP", party: "Ind" },
          narrative: "Hello",
          indexAScore: 80,
          indexBScore: 70,
          indexCScore: 60,
          overallScore: 75,
          headlineBlend: "0.5A+0.35B+0.15C",
          metrics: null,
          updatedAt: "2026-03-28T00:00:00.000Z",
        },
      ],
    });
    const res = await GET(new Request("https://example.com/api/report-card/2099"), ctx("2099"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      disputeWindowEndsAt: string | null;
      entries: Array<{
        indexAScore: number | null;
        indexBScore: number | null;
        indexCScore: number | null;
        headlineBlend: string;
        overallScore: number | null;
      }>;
    };
    expect(json.disputeWindowEndsAt).toBeNull();
    expect(json.entries[0].indexAScore).toBeNull();
    expect(json.entries[0].indexBScore).toBeNull();
    expect(json.entries[0].indexCScore).toBeNull();
    expect(json.entries[0].headlineBlend).toBe("phase2Summary");
    expect(json.entries[0].overallScore).toBe(75);
  });
});
