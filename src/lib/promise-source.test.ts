import { describe, expect, it } from "vitest";

import { primarySourceUrl } from "./promise-source";

describe("primarySourceUrl", () => {
  it("prefers explicit promise sourceUrl", () => {
    expect(
      primarySourceUrl({
        sourceUrl: "https://example.com/speech",
        manifestoDocument: { sourceUrl: "https://example.com/manifesto.pdf" },
      }),
    ).toBe("https://example.com/speech");
  });

  it("falls back to manifesto document URL", () => {
    expect(
      primarySourceUrl({
        sourceUrl: null,
        manifestoDocument: { sourceUrl: "https://example.com/manifesto.pdf" },
      }),
    ).toBe("https://example.com/manifesto.pdf");
  });

  it("returns null when neither is set", () => {
    expect(primarySourceUrl({ sourceUrl: null, manifestoDocument: null })).toBeNull();
  });
});
