import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const pdfParseMock = vi.fn();

vi.mock("pdf-parse/lib/pdf-parse.js", () => ({
  default: (...args: unknown[]) => pdfParseMock(...args),
}));

import { extractPdfText, pdfBufferFromPayload } from "./extract-pdf-text";

describe("pdfBufferFromPayload", () => {
  it("returns null for empty or invalid base64", () => {
    expect(pdfBufferFromPayload("")).toBeNull();
    expect(pdfBufferFromPayload("   ")).toBeNull();
    expect(pdfBufferFromPayload("not!!!base64")).toBeNull();
  });

  it("decodes raw base64", () => {
    const buf = pdfBufferFromPayload("SGk=");
    expect(buf).not.toBeNull();
    expect(buf?.toString("utf8")).toBe("Hi");
  });

  it("strips data:application/pdf;base64, prefix", () => {
    const buf = pdfBufferFromPayload("data:application/pdf;base64,SGk=");
    expect(buf?.toString("utf8")).toBe("Hi");
  });

  it("allows whitespace in payload", () => {
    const buf = pdfBufferFromPayload(" data:application/pdf;base64, S G k = ");
    expect(buf?.toString("utf8")).toBe("Hi");
  });
});

describe("extractPdfText", () => {
  beforeEach(() => {
    pdfParseMock.mockReset();
  });

  it("rejects buffers over the byte cap without calling pdf-parse", async () => {
    const huge = Buffer.alloc(1.3 * 1024 * 1024);
    const r = await extractPdfText(huge);
    expect(r.error).toBe("PDF exceeds size limit.");
    expect(r.text).toBe("");
    expect(pdfParseMock).not.toHaveBeenCalled();
  });

  it("normalizes text from pdf-parse", async () => {
    pdfParseMock.mockResolvedValue({ text: "  Hello\x00world  \nline  " });
    const r = await extractPdfText(Buffer.from("%PDF-fake"));
    expect(r.error).toBeUndefined();
    expect(r.text).toBe("Hello world line");
  });

  it("caps extracted character length", async () => {
    const long = "a".repeat(60_000);
    pdfParseMock.mockResolvedValue({ text: long });
    const r = await extractPdfText(Buffer.from("x"));
    expect(r.text?.length).toBe(55_000);
  });

  it("returns a friendly error when pdf-parse throws", async () => {
    pdfParseMock.mockRejectedValue(new Error("parse fail"));
    const r = await extractPdfText(Buffer.from("x"));
    expect(r.text).toBe("");
    expect(r.error).toBe("Could not read this PDF (it may be scanned or encrypted).");
  });
});
