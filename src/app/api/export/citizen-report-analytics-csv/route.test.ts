import { beforeEach, describe, expect, it, vi } from "vitest";

const voiceStatsOn = { value: true };
const dbConfigured = { value: true };

vi.mock("@/lib/reports/accountability-pages", () => ({
  isPublicVoiceStatisticsEnabled: () => voiceStatsOn.value,
}));

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: () => dbConfigured.value,
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/server/citizen-report-analytics", () => ({
  getCitizenReportAnalytics: vi.fn(),
}));

import { GET } from "./route";
import { getCitizenReportAnalytics } from "@/lib/server/citizen-report-analytics";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

describe("GET /api/export/citizen-report-analytics-csv", () => {
  beforeEach(() => {
    voiceStatsOn.value = true;
    dbConfigured.value = true;
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(getCitizenReportAnalytics).mockResolvedValue({
      generatedAt: "2026-07-24T00:00:00.000Z",
      windowMonths: 12,
      windowSince: "2025-07-01T00:00:00.000Z",
      totals: {
        all: 10,
        inWindow: 4,
        byKind: { VOICE: 10 },
        byStatus: { RECEIVED: 10 },
        byKindInWindow: { VOICE: 4 },
        byStatusInWindow: { RECEIVED: 4 },
        withAttachments: 2,
        slaOpenOverdue: 0,
      },
      byPlaybookAll: [],
      byPlaybookInWindow: [],
      publicCauses: { withThread: 1, threadLive: 1, threadClosed: 0 },
      byRegion: [],
      byMonth: [{ yearMonth: "2026-01", count: 2 }],
    });
  });

  it("returns 404 when public voice statistics are off", async () => {
    voiceStatsOn.value = false;
    const res = await GET(new Request("https://example.com/api/export/citizen-report-analytics-csv"));
    expect(res.status).toBe(404);
  });

  it("returns 503 when database is not configured", async () => {
    dbConfigured.value = false;
    const res = await GET(new Request("https://example.com/api/export/citizen-report-analytics-csv"));
    expect(res.status).toBe(503);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const res = await GET(new Request("https://example.com/api/export/citizen-report-analytics-csv"));
    expect(res.status).toBe(429);
  });

  it("returns CSV with BOM and aggregate rows", async () => {
    const res = await GET(
      new Request("https://example.com/api/export/citizen-report-analytics-csv?months=12"),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(getCitizenReportAnalytics).toHaveBeenCalledWith(12);
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(buf[0]).toBe(0xef);
    expect(buf[1]).toBe(0xbb);
    expect(buf[2]).toBe(0xbf);
    const text = new TextDecoder("utf-8").decode(buf);
    expect(text).toContain("section,metric,value");
    expect(text).toContain("totals");
    expect(text).toContain("all");
  });
});
