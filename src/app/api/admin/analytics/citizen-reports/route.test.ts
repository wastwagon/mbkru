import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/session", () => ({
  getAdminSession: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: vi.fn(),
}));

vi.mock("@/lib/server/citizen-report-analytics", () => ({
  getCitizenReportAnalytics: vi.fn(),
}));

import { GET } from "./route";
import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getCitizenReportAnalytics } from "@/lib/server/citizen-report-analytics";

const sample = {
  generatedAt: "2026-01-01T00:00:00.000Z",
  windowMonths: 12,
  windowSince: "2025-01-01T00:00:00.000Z",
  totals: {
    all: 10,
    inWindow: 2,
    byKind: { VOICE: 10 },
    byStatus: { RECEIVED: 10 },
    byKindInWindow: { VOICE: 2 },
    byStatusInWindow: { RECEIVED: 2 },
    withAttachments: 0,
    slaOpenOverdue: 0,
  },
  byRegion: [],
  byMonth: [{ yearMonth: "2025-12", count: 2 }],
};

describe("GET /api/admin/analytics/citizen-reports", () => {
  beforeEach(() => {
    vi.mocked(getAdminSession).mockReset();
    vi.mocked(isDatabaseConfigured).mockReset();
    vi.mocked(getCitizenReportAnalytics).mockReset();
  });

  it("returns 401 without admin session", async () => {
    vi.mocked(getAdminSession).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/analytics/citizen-reports"));
    expect(res.status).toBe(401);
  });

  it("returns 503 when database not configured", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    const res = await GET(new Request("http://localhost/api/admin/analytics/citizen-reports"));
    expect(res.status).toBe(503);
  });

  it("returns 200 and JSON with analytics", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(getCitizenReportAnalytics).mockResolvedValue(sample);

    const res = await GET(new Request("http://localhost/api/admin/analytics/citizen-reports?months=12"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const json = await res.json();
    expect(json.totals.all).toBe(10);
    expect(json.byMonth).toHaveLength(1);
    expect(getCitizenReportAnalytics).toHaveBeenCalledWith(12);
  });
});
