import { describe, expect, it } from "vitest";

import { gateFallbackOnProbeFailure } from "@/lib/construction-gate-fallback";

describe("gateFallbackOnProbeFailure", () => {
  it("reuses the last known gate value when available", () => {
    expect(gateFallbackOnProbeFailure(true, true)).toBe(true);
    expect(gateFallbackOnProbeFailure(false, true)).toBe(false);
    expect(gateFallbackOnProbeFailure(true, false)).toBe(true);
  });

  it("fails closed in production when nothing is known", () => {
    expect(gateFallbackOnProbeFailure(null, true)).toBe(true);
  });

  it("fails open outside production when nothing is known", () => {
    expect(gateFallbackOnProbeFailure(null, false)).toBe(false);
  });
});
