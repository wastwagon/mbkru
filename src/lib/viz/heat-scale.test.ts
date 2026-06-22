import { describe, expect, it } from "vitest";

import { heatFillColor, normalizeHeatIntensity } from "@/lib/viz/heat-scale";

describe("heat-scale", () => {
  it("normalizes intensity between 0 and 1", () => {
    expect(normalizeHeatIntensity(0, 10)).toBe(0);
    expect(normalizeHeatIntensity(5, 10)).toBe(0.5);
    expect(normalizeHeatIntensity(15, 10)).toBe(1);
  });

  it("returns muted fill when no data", () => {
    expect(heatFillColor(0, false)).toMatch(/hsl/);
  });

  it("returns stronger fill at higher intensity", () => {
    const low = heatFillColor(0.2, true);
    const high = heatFillColor(0.9, true);
    expect(low).not.toBe(high);
  });
});
