import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { formatWeekDelta } from "@/lib/server/admin-home-attention";

describe("formatWeekDelta", () => {
  it("labels flat weeks", () => {
    expect(formatWeekDelta({ current: 3, previous: 3 })).toEqual({
      text: "±0 vs prior week",
      tone: "neutral",
    });
  });

  it("labels increases and decreases", () => {
    expect(formatWeekDelta({ current: 5, previous: 2 }).text).toBe("+3 vs prior week");
    expect(formatWeekDelta({ current: 1, previous: 4 }).text).toBe("-3 vs prior week");
  });
});
