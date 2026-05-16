import { describe, expect, it } from "vitest";

import { computeTripleHeadlineScore, REPORT_CARD_HEADLINE_WEIGHTS } from "./report-card-headline";

describe("computeTripleHeadlineScore", () => {
  it("returns null if any index missing", () => {
    expect(computeTripleHeadlineScore(80, 70, null)).toBeNull();
    expect(computeTripleHeadlineScore(null, 70, 60)).toBeNull();
  });

  it("computes 0.5·A + 0.35·B + 0.15·C on 0–100 inputs", () => {
    const v = computeTripleHeadlineScore(100, 100, 100);
    expect(v).toBe(100);
    const mid = computeTripleHeadlineScore(80, 60, 40);
    expect(mid).toBeCloseTo(0.5 * 80 + 0.35 * 60 + 0.15 * 40, 5);
  });

  it("clamps out-of-range inputs", () => {
    expect(computeTripleHeadlineScore(120, 50, 50)).toBeCloseTo(0.5 * 100 + 0.35 * 50 + 0.15 * 50, 5);
  });
});

describe("REPORT_CARD_HEADLINE_WEIGHTS", () => {
  it("sums to 1", () => {
    const { a, b, c } = REPORT_CARD_HEADLINE_WEIGHTS;
    expect(a + b + c).toBeCloseTo(1, 6);
  });
});
