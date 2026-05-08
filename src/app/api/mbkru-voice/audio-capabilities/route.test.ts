import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

import { GET } from "./route";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

describe("GET /api/mbkru-voice/audio-capabilities", () => {
  beforeEach(() => {
    vi.mocked(allowPublicFormRequest).mockReset();
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const res = await GET(new Request("http://localhost/api/mbkru-voice/audio-capabilities"));
    expect(res.status).toBe(429);
  });

  it("returns whisper and tts false when OPENAI_API_KEY is unset", async () => {
    delete process.env.OPENAI_API_KEY;
    const res = await GET(new Request("http://localhost/api/mbkru-voice/audio-capabilities"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { whisper: boolean; tts: boolean };
    expect(json.whisper).toBe(false);
    expect(json.tts).toBe(false);
  });

  it("returns whisper and tts true when OPENAI_API_KEY is set", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const res = await GET(new Request("http://localhost/api/mbkru-voice/audio-capabilities"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { whisper: boolean; tts: boolean };
    expect(json.whisper).toBe(true);
    expect(json.tts).toBe(true);
  });
});
