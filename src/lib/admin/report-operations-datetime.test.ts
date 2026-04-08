import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatUtcForDatetimeLocalInput,
  isCitizenReportSlaOverdue,
  parseUtcDatetimeLocalInput,
} from "./report-operations-datetime";

describe("report-operations-datetime", () => {
  it("round-trips UTC wall time through datetime-local string", () => {
    const d = new Date("2026-04-07T14:30:00.000Z");
    const s = formatUtcForDatetimeLocalInput(d);
    expect(s).toBe("2026-04-07T14:30");
    expect(parseUtcDatetimeLocalInput(s)?.toISOString()).toBe("2026-04-07T14:30:00.000Z");
  });

  it("parse rejects empty", () => {
    expect(parseUtcDatetimeLocalInput("")).toBeNull();
    expect(parseUtcDatetimeLocalInput("   ")).toBeNull();
  });
});

describe("isCitizenReportSlaOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-07T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is false when closed or no SLA", () => {
    expect(isCitizenReportSlaOverdue(null, "RECEIVED")).toBe(false);
    expect(isCitizenReportSlaOverdue(new Date("2026-04-01T00:00:00.000Z"), "CLOSED")).toBe(false);
  });

  it("is true when SLA is in the past and status is open", () => {
    expect(isCitizenReportSlaOverdue(new Date("2026-04-01T00:00:00.000Z"), "UNDER_REVIEW")).toBe(true);
  });
});
