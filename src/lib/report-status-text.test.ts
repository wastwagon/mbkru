import { describe, expect, it } from "vitest";

import {
  buildReportAdminReplyEmailBody,
  buildReportAdminReplySmsBody,
  buildReportAdminReplyVisibleAgainEmailBody,
  buildReportAdminReplyVisibleAgainSmsBody,
  buildReportStatusSmsBody,
} from "./report-status-text";

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

describe("buildReportAdminReplyEmailBody", () => {
  it("includes tracking code and reply text", () => {
    const t = buildReportAdminReplyEmailBody({
      kind: "VOICE",
      trackingCode: "XYZ999",
      replyBody: "We received your report.",
    });
    expect(t).toContain("XYZ999");
    expect(t).toContain("We received your report.");
    expect(t).toContain("new note");
  });

  it("uses update wording when isUpdate", () => {
    const t = buildReportAdminReplyEmailBody({
      kind: "VOICE",
      trackingCode: "X",
      replyBody: "Hi",
      isUpdate: true,
    });
    expect(t).toContain("updated note");
  });
});

describe("buildReportAdminReplySmsBody", () => {
  it("mentions tracking code and avoids embedding long reply text", () => {
    const t = buildReportAdminReplySmsBody({ kind: "VOICE", trackingCode: "ABC" });
    expect(t).toContain("ABC");
    expect(t.length).toBeLessThan(200);
  });

  it("uses update wording when isUpdate", () => {
    const t = buildReportAdminReplySmsBody({ kind: "VOICE", trackingCode: "Z", isUpdate: true });
    expect(t).toContain("Updated");
  });
});

describe("visible-again helpers", () => {
  it("email body mentions visibility", () => {
    const t = buildReportAdminReplyVisibleAgainEmailBody({ kind: "VOICE", trackingCode: "T1" });
    expect(t).toContain("T1");
    expect(t.toLowerCase()).toContain("visible");
  });

  it("sms body is short", () => {
    const t = buildReportAdminReplyVisibleAgainSmsBody({ kind: "VOICE", trackingCode: "T2" });
    expect(t).toContain("T2");
    expect(t.length).toBeLessThan(200);
  });
});
