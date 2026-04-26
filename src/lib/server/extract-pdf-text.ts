import "server-only";

/** Use the inner module so we avoid `pdf-parse/index.js` debug I/O when `module.parent` is absent (Vitest, some runners). */
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const MAX_PDF_BYTES = 1.25 * 1024 * 1024;
const MAX_EXTRACT_CHARS = 55_000;

/**
 * Extract plain text from a PDF buffer (server-only; uses `pdf-parse`).
 * Returns empty text with `error` when parsing fails or the file is too large.
 */
export async function extractPdfText(buffer: Buffer): Promise<{ text: string; error?: string }> {
  if (buffer.length > MAX_PDF_BYTES) {
    return { text: "", error: "PDF exceeds size limit." };
  }
  try {
    const data = await pdfParse(buffer);
    const raw = (data.text ?? "").replace(/\u0000/g, " ").replace(/\s+/g, " ").trim();
    return { text: raw.slice(0, MAX_EXTRACT_CHARS) };
  } catch {
    return { text: "", error: "Could not read this PDF (it may be scanned or encrypted)." };
  }
}

/** Accept raw base64 or `data:application/pdf;base64,...` */
export function pdfBufferFromPayload(payload: string): Buffer | null {
  const t = payload.trim();
  const b64 = t.startsWith("data:application/pdf;base64,")
    ? t.slice("data:application/pdf;base64,".length)
    : t;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(b64.replace(/\s/g, ""))) return null;
  try {
    return Buffer.from(b64.replace(/\s/g, ""), "base64");
  } catch {
    return null;
  }
}
