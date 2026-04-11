import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_PROMISES_BROWSE_EMBED_URL, resolvePromisesBrowseEmbedUrlForHomepage } from "./promises-browse-embed";

describe("resolvePromisesBrowseEmbedUrlForHomepage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns default when env unset", () => {
    vi.stubEnv("NEXT_PUBLIC_PROMISES_BROWSE_EMBED_URL", "");
    expect(resolvePromisesBrowseEmbedUrlForHomepage()).toBe(DEFAULT_PROMISES_BROWSE_EMBED_URL);
  });

  it("returns null when off", () => {
    vi.stubEnv("NEXT_PUBLIC_PROMISES_BROWSE_EMBED_URL", "off");
    expect(resolvePromisesBrowseEmbedUrlForHomepage()).toBeNull();
  });

  it("returns valid https URL", () => {
    vi.stubEnv("NEXT_PUBLIC_PROMISES_BROWSE_EMBED_URL", "https://example.com/promises/browse");
    expect(resolvePromisesBrowseEmbedUrlForHomepage()).toBe("https://example.com/promises/browse");
  });
});
