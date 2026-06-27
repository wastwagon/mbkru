import { describe, expect, it } from "vitest";

import { suggestIndexCFromRubric } from "./mp-rubric-index-c";

describe("suggestIndexCFromRubric", () => {
  it("returns null for empty or invalid rubric", () => {
    expect(suggestIndexCFromRubric(null)).toBeNull();
    expect(suggestIndexCFromRubric([])).toBeNull();
    expect(suggestIndexCFromRubric({})).toBeNull();
  });

  it("maps average 1–5 scores to 0–100 Index C", () => {
    expect(
      suggestIndexCFromRubric({
        accessibility: 5,
        responsiveness: 5,
        followThrough: 5,
      }),
    ).toBe(100);
    expect(
      suggestIndexCFromRubric({
        accessibility: 3,
        responsiveness: 3,
      }),
    ).toBe(60);
  });
});
