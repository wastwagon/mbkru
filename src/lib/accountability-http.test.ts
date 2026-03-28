import { describe, expect, it } from "vitest";

import {
  ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC,
  accountabilityApiNotFoundCacheControl,
  accountabilityPublicCacheControl,
} from "./accountability-http";

describe("accountability-http", () => {
  it("uses 300s max-age aligned with unstable_cache TTL", () => {
    expect(ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC).toBe(300);
  });

  it("publicCacheControl includes s-maxage and stale-while-revalidate", () => {
    const h = accountabilityPublicCacheControl();
    expect(h).toContain("public");
    expect(h).toContain("max-age=300");
    expect(h).toContain("s-maxage=300");
    expect(h).toContain("stale-while-revalidate=600");
  });

  it("notFound policy is private no-store", () => {
    expect(accountabilityApiNotFoundCacheControl()).toBe("private, no-store");
  });
});
