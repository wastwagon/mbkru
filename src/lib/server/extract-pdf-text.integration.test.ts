import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { describe, expect, it, vi } from "vitest";

/** Required so this file can import `@/lib/server` modules in Vitest. */
vi.mock("server-only", () => ({}));

const require = createRequire(import.meta.url);
const pdfPackageRoot = dirname(require.resolve("pdf-parse/package.json"));
const pdfParseSamplePath = join(pdfPackageRoot, "test", "data", "04-valid.pdf");

import { extractPdfText, pdfBufferFromPayload } from "./extract-pdf-text";

describe("extractPdfText (integration, real pdf-parse)", () => {
  it("extracts from the pdf-parse package sample and round-trips base64", async () => {
    const fileBuf = readFileSync(pdfParseSamplePath);
    const a = await extractPdfText(fileBuf);
    expect(a.error, a.error).toBeUndefined();
    expect(a.text.length).toBeGreaterThan(200);

    const b64 = fileBuf.toString("base64");
    const roundTrip = pdfBufferFromPayload(`data:application/pdf;base64,${b64}`);
    expect(roundTrip).not.toBeNull();
    const b = await extractPdfText(roundTrip!);
    expect(b.error, b.error).toBeUndefined();
    expect(b.text).toBe(a.text);
  });
});
