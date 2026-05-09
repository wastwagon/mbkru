import { describe, expect, it } from "vitest";

import { createReportBodySchema } from "./reports";

const base = {
  kind: "VOICE" as const,
  title: "Enough length in title here",
  body: "Enough characters in body for validation rules here.",
  regionId: "cjld2cjxh0000qzrmn831i7rn",
  localArea: "East Legon",
  latitude: 5.6037,
  longitude: -0.187,
};

const mpBase = {
  ...base,
  kind: "MP_PERFORMANCE" as const,
};

describe("createReportBodySchema", () => {
  it("accepts optional E.164 submitterPhone", () => {
    const r = createReportBodySchema.safeParse({
      ...base,
      submitterEmail: "a@b.co",
      submitterPhone: "+233201234567",
    });
    expect(r.success).toBe(true);
  });

  it("rejects invalid submitterPhone", () => {
    const r = createReportBodySchema.safeParse({
      ...base,
      submitterEmail: "a@b.co",
      submitterPhone: "0201234567",
    });
    expect(r.success).toBe(false);
  });

  it("rejects localArea shorter than 3 characters", () => {
    const r = createReportBodySchema.safeParse({
      ...base,
      submitterEmail: "a@b.co",
      localArea: "Ab",
    });
    expect(r.success).toBe(false);
  });

  it("requires parliamentMemberId for MP_PERFORMANCE", () => {
    const r = createReportBodySchema.safeParse({
      ...mpBase,
      submitterEmail: "a@b.co",
    });
    expect(r.success).toBe(false);
  });

  it("accepts MP_PERFORMANCE with parliamentMemberId", () => {
    const r = createReportBodySchema.safeParse({
      ...mpBase,
      submitterEmail: "a@b.co",
      parliamentMemberId: "cjld2cjxh0000qzrmn831i7rn",
    });
    expect(r.success).toBe(true);
  });
});
