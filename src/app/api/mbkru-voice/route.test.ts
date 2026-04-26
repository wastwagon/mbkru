import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/server/extract-pdf-text", () => ({
  pdfBufferFromPayload: vi.fn(),
  extractPdfText: vi.fn(),
}));

vi.mock("@/lib/mbkru-voice-openai", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/mbkru-voice-openai")>();
  return {
    ...mod,
    fetchMbkruVoiceOpenAi: vi.fn().mockResolvedValue("Model reply from test."),
  };
});

import { POST } from "./route";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { extractPdfText, pdfBufferFromPayload } from "@/lib/server/extract-pdf-text";
import { fetchMbkruVoiceOpenAi } from "@/lib/mbkru-voice-openai";

describe("POST /api/mbkru-voice", () => {
  beforeEach(() => {
    vi.mocked(allowPublicFormRequest).mockReset();
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(pdfBufferFromPayload).mockReset();
    vi.mocked(extractPdfText).mockReset();
    vi.mocked(fetchMbkruVoiceOpenAi).mockReset();
    vi.mocked(fetchMbkruVoiceOpenAi).mockResolvedValue("Model reply from test.");
    delete process.env.TAVILY_API_KEY;
    process.env.OPENAI_API_KEY = "test-key";
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const req = new Request("http://localhost/api/mbkru-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("returns 400 when PDF payload cannot be decoded", async () => {
    vi.mocked(pdfBufferFromPayload).mockReturnValue(null);
    const req = new Request("http://localhost/api/mbkru-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Summarise the PDF",
        pdfBase64: "not-valid-base64!!!",
        webSearch: false,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid PDF data");
  });

  it("returns 400 when PDF extraction fails", async () => {
    vi.mocked(pdfBufferFromPayload).mockReturnValue(Buffer.from("fake"));
    vi.mocked(extractPdfText).mockResolvedValue({ text: "", error: "Could not read this PDF (it may be scanned or encrypted)." });
    const req = new Request("http://localhost/api/mbkru-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Summarise",
        pdfBase64: "AA==",
        webSearch: false,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns model answer with pdfUsed when PDF parses and OpenAI succeeds", async () => {
    vi.mocked(pdfBufferFromPayload).mockReturnValue(Buffer.from("fakepdf"));
    vi.mocked(extractPdfText).mockResolvedValue({ text: "Chapter one body text." });
    const req = new Request("http://localhost/api/mbkru-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "What is in the PDF?",
        pdfBase64: "AA==",
        fileName: "report.pdf",
        webSearch: false,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { answer: string; pdfUsed?: boolean; source?: string };
    expect(json.answer).toBe("Model reply from test.");
    expect(json.pdfUsed).toBe(true);
    expect(json.source).toBe("ai-provider");
    expect(fetchMbkruVoiceOpenAi).toHaveBeenCalled();
  });
});
