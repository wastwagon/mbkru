import { describe, expect, it } from "vitest";

import { buildReportStatusSmsBody } from "./report-status-text";

describe("buildReportStatusSmsBody", () => {
  it("includes tracking code and status", () => {
    const t = buildReportStatusSmsBody({
      kind: "VOICE",
      status: "UNDER_REVIEW",
      trackingCode: "ABC12345",
    });
    expect(t).toContain("ABC12345");
    expect(t).toContain("Under Review");
  });
});
