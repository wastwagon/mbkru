import { describe, expect, it } from "vitest";

import { parseMpPerformanceRubric } from "./mp-performance-rubric";

describe("parseMpPerformanceRubric", () => {
  it("returns null for empty input", () => {
    expect(parseMpPerformanceRubric(null)).toEqual({ ok: true, value: null });
    expect(parseMpPerformanceRubric("")).toEqual({ ok: true, value: null });
  });

  it("accepts partial objects", () => {
    const r = parseMpPerformanceRubric({ accessibility: 2 });
    expect(r.ok && r.value).toEqual({ accessibility: 2 });
  });

  it("rejects out-of-range values", () => {
    expect(parseMpPerformanceRubric({ accessibility: 0 }).ok).toBe(false);
    expect(parseMpPerformanceRubric({ accessibility: 6 }).ok).toBe(false);
  });

  it("rejects extra keys", () => {
    expect(parseMpPerformanceRubric({ accessibility: 3, extra: 1 }).ok).toBe(false);
  });
});
