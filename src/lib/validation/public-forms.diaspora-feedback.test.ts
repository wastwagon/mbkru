import { describe, expect, it } from "vitest";

import { diasporaFeedbackBodySchema, diasporaFeedbackFormSchema } from "./public-forms";

describe("diasporaFeedbackFormSchema", () => {
  it("requires visit fields when engagementKind is RECENT_VISIT", () => {
    const r = diasporaFeedbackFormSchema.safeParse({
      engagementKind: "RECENT_VISIT",
      fullName: "A B",
      email: "a@example.com",
      dateOfVisit: "",
      durationOfStay: "",
      eventsAttended: "",
      overallRating: "GOOD",
      meaningfulAspects: "x",
      suggestionsImprovement: "y",
      returnOrInvest: "MAYBE",
      signature: "A B",
      formSignedDate: "2026-05-01",
    });
    expect(r.success).toBe(false);
  });

  it("accepts ABROAD_SUPPORTER without visit fields", () => {
    const r = diasporaFeedbackFormSchema.safeParse({
      engagementKind: "ABROAD_SUPPORTER",
      fullName: "A B",
      email: "a@example.com",
      overallRating: "FAIR",
      meaningfulAspects: "Want better promise tracking links.",
      suggestionsImprovement: "More WhatsApp-friendly PDFs.",
      returnOrInvest: "YES",
      signature: "A B",
      formSignedDate: "2026-05-01",
    });
    expect(r.success).toBe(true);
  });
});

describe("diasporaFeedbackBodySchema", () => {
  it("defaults missing engagementKind to RECENT_VISIT and transforms dates", () => {
    const r = diasporaFeedbackBodySchema.safeParse({
      fullName: "A B",
      email: "a@example.com",
      dateOfVisit: "2026-04-10",
      durationOfStay: "2 weeks",
      eventsAttended: "Summit",
      overallRating: "EXCELLENT",
      meaningfulAspects: "Great",
      suggestionsImprovement: "None",
      returnOrInvest: "YES",
      signature: "A B",
      formSignedDate: "2026-05-01",
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.engagementKind).toBe("RECENT_VISIT");
    expect(r.data.dateOfVisit).toBeInstanceOf(Date);
    expect(r.data.durationOfStay).toBe("2 weeks");
  });

  it("transforms ABROAD_SUPPORTER to null visit fields", () => {
    const r = diasporaFeedbackBodySchema.safeParse({
      engagementKind: "ABROAD_SUPPORTER",
      fullName: "A B",
      email: "a@example.com",
      overallRating: "GOOD",
      meaningfulAspects: "Meaning",
      suggestionsImprovement: "Suggestions",
      returnOrInvest: "NO",
      signature: "A B",
      formSignedDate: "2026-05-02",
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.engagementKind).toBe("ABROAD_SUPPORTER");
    expect(r.data.dateOfVisit).toBeNull();
    expect(r.data.durationOfStay).toBeNull();
    expect(r.data.eventsAttended).toBeNull();
  });

  it("rejects RECENT_VISIT without dateOfVisit", () => {
    const r = diasporaFeedbackBodySchema.safeParse({
      engagementKind: "RECENT_VISIT",
      fullName: "A B",
      email: "a@example.com",
      overallRating: "POOR",
      meaningfulAspects: "x",
      suggestionsImprovement: "y",
      returnOrInvest: "MAYBE",
      signature: "A B",
      formSignedDate: "2026-05-01",
    });
    expect(r.success).toBe(false);
  });
});
