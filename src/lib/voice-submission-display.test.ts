import { describe, expect, it } from "vitest";

import {
  formatBrowsePlaceLabel,
  formatCommunityEngagementLine,
  formatCompactEngagementSummary,
  formatDiscussionReactionLine,
  formatDiscussionStatusSuffix,
  bodyPreviewLine,
} from "@/lib/voice-submission-display";

describe("voice-submission-display", () => {
  it("formats discussion status suffix", () => {
    expect(formatDiscussionStatusSuffix(true)).toBe(" · Discussion open");
    expect(formatDiscussionStatusSuffix(false)).toBe(" · Discussion off");
  });
  it("formats engagement line only when counts exist", () => {
    expect(formatCommunityEngagementLine(0, 0)).toBeNull();
    expect(formatCommunityEngagementLine(1, 0)).toBe("Community engagement: 1 supporter · 0 comments");
    expect(formatCommunityEngagementLine(2, 3)).toBe("Community engagement: 2 supporters · 3 comments");
  });

  it("formats reaction line only when reactions exist", () => {
    expect(formatDiscussionReactionLine({ LIKE: 0, THANK: 0, INSIGHT: 0 })).toBeNull();
    expect(formatDiscussionReactionLine({ LIKE: 1, THANK: 0, INSIGHT: 0 })).toBe(
      "On the discussion thread: Like 1 · Thanks 0 · Important 0",
    );
  });

  it("formats compact engagement summary", () => {
    expect(formatCompactEngagementSummary(0, 0, { LIKE: 0, THANK: 0, INSIGHT: 0 })).toBeNull();
    expect(formatCompactEngagementSummary(1, 1, { LIKE: 1, THANK: 0, INSIGHT: 0 })).toBe(
      "1 support · 1 comment · Like 1",
    );
  });

  it("shortens browse place labels", () => {
    expect(
      formatBrowsePlaceLabel(
        "Greater Accra",
        "Ashongman, Dome, Ga East Municipal District, Greater Accra Region, Ghana",
      ),
    ).toBe("Greater Accra · Ashongman");
  });

  it("trims body preview", () => {
    expect(bodyPreviewLine("  hello   world  ")).toBe("hello world");
    expect(bodyPreviewLine("x".repeat(300))?.endsWith("…")).toBe(true);
  });
});
