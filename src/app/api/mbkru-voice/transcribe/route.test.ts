import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/server/mbkru-voice-audio-openai", () => ({
  whisperLanguageHint: vi.fn().mockReturnValue("en"),
  whisperTranscribeFromBuffer: vi.fn().mockResolvedValue({ text: "hello from whisper" }),
}));

import { POST } from "./route";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { whisperTranscribeFromBuffer } from "@/lib/server/mbkru-voice-audio-openai";

describe("POST /api/mbkru-voice/transcribe", () => {
  beforeEach(() => {
    vi.mocked(allowPublicFormRequest).mockReset();
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(whisperTranscribeFromBuffer).mockReset();
    vi.mocked(whisperTranscribeFromBuffer).mockResolvedValue({ text: "hello from whisper" });
    process.env.OPENAI_API_KEY = "test-key";
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const form = new FormData();
    form.append("audio", new Blob([Buffer.from("x")], { type: "audio/webm" }), "a.webm");
    const res = await POST(new Request("http://localhost/api/mbkru-voice/transcribe", { method: "POST", body: form }));
    expect(res.status).toBe(429);
  });

  it("returns 503 when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const form = new FormData();
    form.append("audio", new Blob([Buffer.from("x")], { type: "audio/webm" }), "a.webm");
    const res = await POST(new Request("http://localhost/api/mbkru-voice/transcribe", { method: "POST", body: form }));
    expect(res.status).toBe(503);
  });

  it("returns 400 when audio file is missing", async () => {
    const form = new FormData();
    const res = await POST(new Request("http://localhost/api/mbkru-voice/transcribe", { method: "POST", body: form }));
    expect(res.status).toBe(400);
  });

  it("returns transcript when Whisper succeeds", async () => {
    const form = new FormData();
    form.append("audio", new Blob([Buffer.from("fake")], { type: "audio/webm" }), "a.webm");
    form.append("languageId", "en-gh");
    const res = await POST(new Request("http://localhost/api/mbkru-voice/transcribe", { method: "POST", body: form }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { text: string };
    expect(json.text).toBe("hello from whisper");
    expect(whisperTranscribeFromBuffer).toHaveBeenCalled();
  });

  it("returns 502 when Whisper returns no text", async () => {
    vi.mocked(whisperTranscribeFromBuffer).mockResolvedValue(null);
    const form = new FormData();
    form.append("audio", new Blob([Buffer.from("fake")], { type: "audio/webm" }), "a.webm");
    const res = await POST(new Request("http://localhost/api/mbkru-voice/transcribe", { method: "POST", body: form }));
    expect(res.status).toBe(502);
  });
});
