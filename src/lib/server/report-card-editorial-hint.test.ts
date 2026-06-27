import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildReportCardEditorialHint } from "@/lib/server/report-card-editorial-hint";

describe("buildReportCardEditorialHint", () => {
  it("builds narrative from council evaluation report", () => {
    const hint = buildReportCardEditorialHint({
      trackingCode: "MP-ABC",
      title: "Council meeting",
      body: "Summary of meeting with MP about roads project.",
      intakeSource: "COUNCIL_EVALUATION",
      experienceVerificationTier: "CORROBORATED",
      mpPerformanceRubric: { accessibility: 4, responsiveness: 3, followThrough: 5 },
      staffNotes: "Reviewed by ops.",
      parliamentMember: { id: "mp1", name: "Hon. Ada" },
      community: { name: "Demo Traditional Area" },
    });
    expect(hint).not.toBeNull();
    expect(hint!.parliamentMemberId).toBe("mp1");
    expect(hint!.suggestedNarrative).toContain("MP-ABC");
    expect(hint!.suggestedNarrative).toContain("Demo Traditional Area");
    expect(hint!.suggestedIndexC).toBe(80);
    expect(hint!.intakeLabel).toContain("Council");
  });

  it("returns null without parliament member", () => {
    expect(
      buildReportCardEditorialHint({
        trackingCode: "X",
        title: "T",
        body: "B",
        intakeSource: "CITIZEN_VOICE",
        experienceVerificationTier: "UNVERIFIED",
        mpPerformanceRubric: null,
        staffNotes: null,
        parliamentMember: null,
        community: null,
      }),
    ).toBeNull();
  });
});
