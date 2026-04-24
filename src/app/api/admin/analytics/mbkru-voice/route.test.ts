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
  parseMbkruVoiceAnalyticsDaysParam: vi.fn((raw: string | null) => (raw === "7" ? 7 : 30)),
}));

import { GET } from "./route";
import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  getMbkruVoiceAnalyticsSummary,
  parseMbkruVoiceAnalyticsDaysParam,
} from "@/lib/server/mbkru-voice-analytics";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

const sample = {
  windowDays: 30 as const,
  windowRows: [{ eventName: "mbkru_voice_send", count: 4 }],
  bySourceWindow: [{ source: "client", count: 4 }],
};

describe("GET /api/admin/analytics/mbkru-voice", () => {
  beforeEach(() => {
    vi.mocked(getAdminSession).mockReset();
    vi.mocked(isDatabaseConfigured).mockReset();
    vi.mocked(getMbkruVoiceAnalyticsSummary).mockReset();
    vi.mocked(parseMbkruVoiceAnalyticsDaysParam).mockClear();
    vi.mocked(allowAdminSessionRequest).mockReset();
    vi.mocked(allowAdminSessionRequest).mockResolvedValue(true);
  });

  it("returns 401 without admin session", async () => {
    vi.mocked(getAdminSession).mockResolvedValue(null);
    const res = await GET(new Request("http://localhost/api/admin/analytics/mbkru-voice"));
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(allowAdminSessionRequest).mockResolvedValue(false);
    const res = await GET(new Request("http://localhost/api/admin/analytics/mbkru-voice"));
    expect(res.status).toBe(429);
    expect(getMbkruVoiceAnalyticsSummary).not.toHaveBeenCalled();
  });

  it("returns 503 when database not configured", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    const res = await GET(new Request("http://localhost/api/admin/analytics/mbkru-voice"));
    expect(res.status).toBe(503);
  });

  it("returns 200 and JSON with analytics", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(getMbkruVoiceAnalyticsSummary).mockResolvedValue(sample);

    const res = await GET(new Request("http://localhost/api/admin/analytics/mbkru-voice?days=7"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const json = await res.json();
    expect(json.windowRows).toHaveLength(1);
    expect(parseMbkruVoiceAnalyticsDaysParam).toHaveBeenCalledWith("7");
    expect(getMbkruVoiceAnalyticsSummary).toHaveBeenCalledWith(7);
  });
});
