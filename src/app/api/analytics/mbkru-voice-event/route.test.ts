import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/server/mbkru-voice-analytics", () => ({
  recordMbkruVoiceAnalyticsEvent: vi.fn(),
}));

import { POST } from "./route";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { recordMbkruVoiceAnalyticsEvent } from "@/lib/server/mbkru-voice-analytics";

describe("POST /api/analytics/mbkru-voice-event", () => {
  beforeEach(() => {
    vi.mocked(allowPublicFormRequest).mockReset();
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(recordMbkruVoiceAnalyticsEvent).mockReset();
    delete process.env.MBKRU_VOICE_EVENT_TOKEN;
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const req = new Request("http://localhost/api/analytics/mbkru-voice-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "mbkru_voice_send", payload: {} }),
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("rejects non-allowlisted event names", async () => {
    const req = new Request("http://localhost/api/analytics/mbkru-voice-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "random_event", payload: {} }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(recordMbkruVoiceAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("returns 401 when telemetry token is required but missing", async () => {
    process.env.MBKRU_VOICE_EVENT_TOKEN = "secret-token";
    const req = new Request("http://localhost/api/analytics/mbkru-voice-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "mbkru_voice_send", payload: {} }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("accepts request with valid body token when required", async () => {
    process.env.MBKRU_VOICE_EVENT_TOKEN = "secret-token";
    const req = new Request("http://localhost/api/analytics/mbkru-voice-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "mbkru_voice_send", payload: { language: "en-gh" }, token: "secret-token" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(202);
  });

  it("accepts allowlisted event with sanitized payload", async () => {
    const req = new Request("http://localhost/api/analytics/mbkru-voice-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "mbkru_voice_reply_received",
        payload: { language: "en-gh", count: 2, ok: true, complex: { nested: "x" } },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(202);
    expect(recordMbkruVoiceAnalyticsEvent).toHaveBeenCalledOnce();
  });
});
