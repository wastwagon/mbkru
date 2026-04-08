import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { sendReportStatusSms } from "./send-report-status-sms";

describe("sendReportStatusSms", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ sid: "SMxxx" }),
        }),
      ),
    );
    delete process.env.SMS_PROVIDER;
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM_NUMBER;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SMS_PROVIDER;
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM_NUMBER;
  });

  it("skips when provider none", async () => {
    const r = await sendReportStatusSms({
      to: "+15550001111",
      trackingCode: "T1",
      kind: "VOICE",
      status: "RECEIVED",
    });
    expect(r.mode).toBe("skipped");
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("log provider does not call fetch", async () => {
    process.env.SMS_PROVIDER = "log";
    const r = await sendReportStatusSms({
      to: "+15550001111",
      trackingCode: "T1",
      kind: "VOICE",
      status: "CLOSED",
    });
    expect(r.mode).toBe("sent");
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("twilio provider posts to Twilio", async () => {
    process.env.SMS_PROVIDER = "twilio";
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_AUTH_TOKEN = "secret";
    process.env.TWILIO_FROM_NUMBER = "+15550002222";
    const r = await sendReportStatusSms({
      to: "+233201234567",
      trackingCode: "T9",
      kind: "SITUATIONAL_ALERT",
      status: "ESCALATED",
    });
    expect(r.mode).toBe("sent");
    expect(vi.mocked(fetch)).toHaveBeenCalled();
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("ACtest");
  });

  it("fails for non-E.164", async () => {
    process.env.SMS_PROVIDER = "twilio";
    process.env.TWILIO_ACCOUNT_SID = "ACtest";
    process.env.TWILIO_AUTH_TOKEN = "secret";
    process.env.TWILIO_FROM_NUMBER = "+15550002222";
    const r = await sendReportStatusSms({
      to: "020123",
      trackingCode: "T1",
      kind: "VOICE",
      status: "RECEIVED",
    });
    expect(r.mode).toBe("failed");
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});
