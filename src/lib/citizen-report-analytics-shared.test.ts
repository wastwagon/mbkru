import { describe, expect, it } from "vitest";

import {
  citizenReportAnalyticsToCsv,
  parseCitizenReportAnalyticsMonthsParam,
} from "./citizen-report-analytics-shared";

describe("parseCitizenReportAnalyticsMonthsParam", () => {
  it("returns undefined for empty", () => {
    expect(parseCitizenReportAnalyticsMonthsParam(null)).toBeUndefined();
    expect(parseCitizenReportAnalyticsMonthsParam("")).toBeUndefined();
  });
  it("clamps to 1–36", () => {
    expect(parseCitizenReportAnalyticsMonthsParam("0")).toBe(1);
    expect(parseCitizenReportAnalyticsMonthsParam("99")).toBe(36);
    expect(parseCitizenReportAnalyticsMonthsParam("12")).toBe(12);
  });
});

describe("citizenReportAnalyticsToCsv", () => {
  it("includes rows and escapes commas in region names", () => {
    const data = {
      generatedAt: "2026-01-15T12:00:00.000Z",
      windowMonths: 12,
      windowSince: "2025-01-01T00:00:00.000Z",
      totals: {
        all: 2,
        inWindow: 1,
        byKind: { VOICE: 2 },
        byStatus: { RECEIVED: 2 },
        byKindInWindow: { VOICE: 1 },
        byStatusInWindow: { RECEIVED: 1 },
        withAttachments: 0,
        slaOpenOverdue: 0,
      },
      byPlaybookAll: [{ key: "alpha", count: 1 }],
      byPlaybookInWindow: [{ key: "", count: 1 }],
      publicCauses: { withThread: 0, threadLive: 0, threadClosed: 0 },
      byRegion: [
        {
          regionId: "r1",
          regionSlug: "ga",
          regionName: "Greater Accra, Metro",
          count: 2,
        },
      ],
      byMonth: [{ yearMonth: "2025-12", count: 1 }],
    };
    const csv = citizenReportAnalyticsToCsv(data);
    expect(csv).toContain("totals,all,2");
    expect(csv).toContain("byPlaybookAll,alpha,1");
    expect(csv).toContain("byPlaybookInWindow,(unassigned),1");
    expect(csv).toContain('"Greater Accra, Metro"');
  });
});
