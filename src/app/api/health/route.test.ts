import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/health-status", () => ({
  getHealthStatus: vi.fn(),
}));

import { GET } from "./route";
import { getHealthStatus } from "@/lib/server/health-status";

const basePayload = {
  service: "mbkru-web" as const,
  phase: 1,
  timestamp: "2026-03-28T12:00:00.000Z",
  dependencies: { postgres: "ok" as const, redis: "not_configured" as const },
  accountability: { parliamentJson: false, reportCardJson: false },
  deployment: {
    publicSiteUrlSet: true,
    publicSiteUrlHttps: true,
    publicSiteHost: "example.com",
    openAiVoiceConfigured: false,
  },
};

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.mocked(getHealthStatus).mockReset();
  });

  it("returns 200 and no-store when status is ok", async () => {
    vi.mocked(getHealthStatus).mockResolvedValue({ ...basePayload, status: "ok" });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.service).toBe("mbkru-web");
    expect(json.dependencies.postgres).toBe("ok");
    expect(json.deployment?.publicSiteUrlHttps).toBe(true);
  });

  it("returns 200 when degraded (redis error)", async () => {
    vi.mocked(getHealthStatus).mockResolvedValue({ ...basePayload, status: "degraded" });
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("degraded");
  });

  it("returns 503 when unhealthy", async () => {
    vi.mocked(getHealthStatus).mockResolvedValue({ ...basePayload, status: "unhealthy" });
    const res = await GET();
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.status).toBe("unhealthy");
  });
});
