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

vi.mock("@/lib/server/mbkru-voice-analytics", () => ({
  getMbkruVoiceAnalyticsSummary: vi.fn(),
  mbkruVoiceAnalyticsSummaryToCsv: vi.fn(),
  parseMbkruVoiceAnalyticsDaysParam: vi.fn((raw: string | null) => (raw === "90" ? 90 : 30)),
}));

import { GET } from "./route";
import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  getMbkruVoiceAnalyticsSummary,
  mbkruVoiceAnalyticsSummaryToCsv,
  parseMbkruVoiceAnalyticsDaysParam,
} from "@/lib/server/mbkru-voice-analytics";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

const sample = {
  windowDays: 90 as const,
  windowRows: [{ eventName: "mbkru_voice_send", count: 6 }],
  bySourceWindow: [{ source: "client", count: 6 }],
};

describe("GET /api/admin/analytics/mbkru-voice/export", () => {
  beforeEach(() => {
    vi.mocked(getAdminSession).mockReset();
    vi.mocked(isDatabaseConfigured).mockReset();
    vi.mocked(getMbkruVoiceAnalyticsSummary).mockReset();
    vi.mocked(mbkruVoiceAnalyticsSummaryToCsv).mockReset();
    vi.mocked(parseMbkruVoiceAnalyticsDaysParam).mockClear();
    vi.mocked(allowAdminSessionRequest).mockReset();
    vi.mocked(allowAdminSessionRequest).mockResolvedValue(true);
  });

  it("returns 401 without admin session", async () => {
    vi.mocked(getAdminSession).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/analytics/mbkru-voice/export"));
    expect(res.status).toBe(401);
  });

  it("returns 503 when database not configured", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    const res = await GET(new Request("http://localhost/api/admin/analytics/mbkru-voice/export"));
    expect(res.status).toBe(503);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(allowAdminSessionRequest).mockResolvedValue(false);
    const res = await GET(new Request("http://localhost/api/admin/analytics/mbkru-voice/export"));
    expect(res.status).toBe(429);
    expect(getMbkruVoiceAnalyticsSummary).not.toHaveBeenCalled();
  });

  it("returns CSV attachment with selected days", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(getMbkruVoiceAnalyticsSummary).mockResolvedValue(sample);
    vi.mocked(mbkruVoiceAnalyticsSummaryToCsv).mockReturnValue("section,key,count\nwindow_90_days,mbkru_voice_send,6");

    const res = await GET(new Request("http://localhost/api/admin/analytics/mbkru-voice/export?days=90"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("mbkru-voice-analytics-90d-");
    const text = await res.text();
    expect(text.includes("section,key,count")).toBe(true);
    expect(parseMbkruVoiceAnalyticsDaysParam).toHaveBeenCalledWith("90");
    expect(getMbkruVoiceAnalyticsSummary).toHaveBeenCalledWith(90);
  });
});
