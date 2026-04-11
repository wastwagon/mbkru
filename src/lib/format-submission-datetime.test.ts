import { describe, expect, it } from "vitest";

import { formatSubmissionDateTime, submissionDateTimeIso } from "./format-submission-datetime";

describe("formatSubmissionDateTime", () => {
  it("formats ISO strings with date and time", () => {
    const s = formatSubmissionDateTime("2026-04-10T14:30:00.000Z");
    expect(s).toMatch(/2026/);
    expect(s).toMatch(/14:30|15:30/);
  });

  it("returns ISO for machine use", () => {
    const d = new Date("2026-01-02T03:04:05.000Z");
    expect(submissionDateTimeIso(d)).toBe(d.toISOString());
  });
});
