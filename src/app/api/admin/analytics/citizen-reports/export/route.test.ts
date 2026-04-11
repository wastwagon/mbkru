import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/session", () => ({
  getAdminSession: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowAdminSessionRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/server/citizen-report-analytics", async () => ({
  getCitizenReportAnalytics: vi.fn(),
}));

import { GET } from "./route";
import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getCitizenReportAnalytics } from "@/lib/server/citizen-report-analytics";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

const sample = {
  generatedAt: "2026-01-01T00:00:00.000Z",
  windowMonths: 6,
  windowSince: "2025-07-01T00:00:00.000Z",
  totals: {
    all: 3,
    inWindow: 1,
    byKind: { VOICE: 3 },
    byStatus: { RECEIVED: 3 },
    byKindInWindow: { VOICE: 1 },
    byStatusInWindow: { RECEIVED: 1 },
    withAttachments: 0,
    slaOpenOverdue: 0,
  },
  byPlaybookAll: [],
  byPlaybookInWindow: [],
  publicCauses: { withThread: 0, threadLive: 0, threadClosed: 0 },
  byRegion: [],
  byMonth: [],
};

describe("GET /api/admin/analytics/citizen-reports/export", () => {
  beforeEach(() => {
    vi.mocked(getAdminSession).mockReset();
    vi.mocked(isDatabaseConfigured).mockReset();
    vi.mocked(getCitizenReportAnalytics).mockReset();
    vi.mocked(allowAdminSessionRequest).mockReset();
    vi.mocked(allowAdminSessionRequest).mockResolvedValue(true);
  });

  it("returns 401 without admin session", async () => {
    vi.mocked(getAdminSession).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/analytics/citizen-reports/export"));
    expect(res.status).toBe(401);
  });

  it("returns 503 when database not configured", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    const res = await GET(new Request("http://localhost/api/admin/analytics/citizen-reports/export"));
    expect(res.status).toBe(503);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(allowAdminSessionRequest).mockResolvedValue(false);
    const res = await GET(new Request("http://localhost/api/admin/analytics/citizen-reports/export"));
    expect(res.status).toBe(429);
    expect(getCitizenReportAnalytics).not.toHaveBeenCalled();
  });

  it("returns CSV attachment", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(getCitizenReportAnalytics).mockResolvedValue(sample);

    const res = await GET(
      new Request("http://localhost/api/admin/analytics/citizen-reports/export?months=6"),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("attachment");
    expect(res.headers.get("Content-Disposition")).toContain("citizen-report-aggregates-6m-");
    const text = await res.text();
    expect(text.includes("section,metric,value")).toBe(true);
    expect(text.includes("totals,all,3")).toBe(true);
    expect(getCitizenReportAnalytics).toHaveBeenCalledWith(6);
  });
});
