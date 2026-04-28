import { describe, expect, it } from "vitest";

import { isThreadActivityBumped, THREAD_ACTIVITY_BUMP_MS } from "./community-thread-ui";

describe("isThreadActivityBumped", () => {
  it("returns false when activity equals start", () => {
    const t = new Date("2026-01-01T12:00:00.000Z");
    expect(isThreadActivityBumped(t, t)).toBe(false);
  });

  it("returns false for tiny delta", () => {
    const a = new Date("2026-01-01T12:00:00.000Z");
    const b = new Date(a.getTime() + THREAD_ACTIVITY_BUMP_MS / 2);
    expect(isThreadActivityBumped(a, b)).toBe(false);
  });

  it("returns true when clearly bumped", () => {
    const a = new Date("2026-01-01T12:00:00.000Z");
    const b = new Date(a.getTime() + THREAD_ACTIVITY_BUMP_MS + 1);
    expect(isThreadActivityBumped(a, b)).toBe(true);
  });
});
