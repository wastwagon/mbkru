import { describe, expect, it } from "vitest";

import { buildCouncilRubricJson } from "@/lib/validation/council-mp-evaluation";

describe("buildCouncilRubricJson", () => {
  it("builds rubric when scores present", () => {
    const r = buildCouncilRubricJson({
      parliamentMemberId: "x",
      meetingDate: "2026-01-01",
      meetingSummary: "Council met with MP to review clinic project timeline and funding.",
      accessibility: 4,
      responsiveness: 3,
    });
    expect(r).toEqual({ accessibility: 4, responsiveness: 3 });
  });

  it("returns null when no scores", () => {
    const r = buildCouncilRubricJson({
      parliamentMemberId: "x",
      meetingDate: "2026-01-01",
      meetingSummary: "Council met with MP to review clinic project timeline and funding.",
    });
    expect(r).toBeNull();
  });
});
