import { describe, expect, it } from "vitest";

import { createReportBodySchema } from "./reports";

const base = {
  kind: "VOICE" as const,
  title: "Enough length in title here",
  body: "Enough characters in body for validation rules here.",
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
});
