import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/server/mbkru-voice-audio-openai", () => ({
  openAiSpeechSynthesize: vi.fn().mockResolvedValue(Buffer.from([0xff, 0xf3, 0x14, 0xc4])),
}));

import { POST } from "./route";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { openAiSpeechSynthesize } from "@/lib/server/mbkru-voice-audio-openai";

describe("POST /api/mbkru-voice/speech", () => {
  beforeEach(() => {
    vi.mocked(allowPublicFormRequest).mockReset();
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(openAiSpeechSynthesize).mockReset();
    vi.mocked(openAiSpeechSynthesize).mockResolvedValue(Buffer.from([0xff, 0xf3, 0x14, 0xc4]));
    process.env.OPENAI_API_KEY = "test-key";
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const res = await POST(
      new Request("http://localhost/api/mbkru-voice/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hello" }),
      }),
    );
    expect(res.status).toBe(429);
  });

  it("returns 503 when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const res = await POST(
      new Request("http://localhost/api/mbkru-voice/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hello" }),
      }),
    );
    expect(res.status).toBe(503);
  });

  it("returns 400 for invalid JSON body", async () => {
    const res = await POST(
      new Request("http://localhost/api/mbkru-voice/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns audio/mpeg when TTS succeeds", async () => {
    const res = await POST(
      new Request("http://localhost/api/mbkru-voice/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hello there", speed: 1 }),
      }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("audio/mpeg");
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.length).toBeGreaterThan(0);
    expect(openAiSpeechSynthesize).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Hello there", speed: 1 }),
    );
  });

  it("returns 502 when synthesize returns empty", async () => {
    vi.mocked(openAiSpeechSynthesize).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/mbkru-voice/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hi" }),
      }),
    );
    expect(res.status).toBe(502);
  });
});
