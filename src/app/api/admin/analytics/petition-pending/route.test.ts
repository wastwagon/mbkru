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

vi.mock("@/lib/server/petition-pending-analytics", () => ({
  getPetitionPendingAnalytics: vi.fn(),
}));

import { GET } from "./route";
import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getPetitionPendingAnalytics } from "@/lib/server/petition-pending-analytics";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

const sample = {
  generatedAt: "2026-01-01T00:00:00.000Z",
  totals: {
    activePending: 2,
    expiredPending: 1,
    allPendingRows: 3,
    verifiedSignatures: 10,
  },
  createdCounts: { last24h: 0, last7d: 1, last30d: 3 },
  byPetition: [],
};

describe("GET /api/admin/analytics/petition-pending", () => {
  beforeEach(() => {
    vi.mocked(getAdminSession).mockReset();
    vi.mocked(isDatabaseConfigured).mockReset();
    vi.mocked(getPetitionPendingAnalytics).mockReset();
    vi.mocked(allowAdminSessionRequest).mockReset();
    vi.mocked(allowAdminSessionRequest).mockResolvedValue(true);
  });

  it("returns 401 without admin session", async () => {
    vi.mocked(getAdminSession).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(allowAdminSessionRequest).mockResolvedValue(false);
    const res = await GET();
    expect(res.status).toBe(429);
    expect(getPetitionPendingAnalytics).not.toHaveBeenCalled();
  });

  it("returns 503 when database not configured", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    const res = await GET();
    expect(res.status).toBe(503);
  });

  it("returns 200 and JSON with analytics", async () => {
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "a1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(getPetitionPendingAnalytics).mockResolvedValue(sample);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const json = await res.json();
    expect(json.totals.activePending).toBe(2);
    expect(json.byPetition).toEqual([]);
    expect(getPetitionPendingAnalytics).toHaveBeenCalledOnce();
  });
});
