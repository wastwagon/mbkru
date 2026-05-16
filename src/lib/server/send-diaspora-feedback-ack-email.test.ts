import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: (...args: unknown[]) => mockSend(...args),
    };
  },
}));

describe("sendDiasporaFeedbackAcknowledgement", () => {
  const prevKey = process.env.RESEND_API_KEY;
  const prevFrom = process.env.RESEND_FROM_EMAIL;
  const prevSite = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: "email_1" }, error: null });
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "MBKRU <test@example.com>";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.org";
  });

  afterEach(() => {
    process.env.RESEND_API_KEY = prevKey;
    process.env.RESEND_FROM_EMAIL = prevFrom;
    process.env.NEXT_PUBLIC_SITE_URL = prevSite;
  });

  it("skips when RESEND_API_KEY is unset", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendDiasporaFeedbackAcknowledgement } = await import("./send-diaspora-feedback-ack-email");
    const out = await sendDiasporaFeedbackAcknowledgement({
      to: "user@example.com",
      fullName: "Test User",
      receivedAtIso: "2026-05-01T12:00:00.000Z",
      engagementKind: "ABROAD_SUPPORTER",
    });
    expect(out).toEqual({ mode: "skipped" });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("sends when Resend is configured", async () => {
    const { sendDiasporaFeedbackAcknowledgement } = await import("./send-diaspora-feedback-ack-email");
    const out = await sendDiasporaFeedbackAcknowledgement({
      to: "user@example.com",
      fullName: "Test User",
      receivedAtIso: "2026-05-01T12:00:00.000Z",
      engagementKind: "RECENT_VISIT",
    });
    expect(out).toEqual({ mode: "sent" });
    expect(mockSend).toHaveBeenCalledTimes(1);
    const arg = mockSend.mock.calls[0][0] as { to: string[]; subject: string; text: string };
    expect(arg.to).toEqual(["user@example.com"]);
    expect(arg.subject).toContain("diaspora");
    expect(arg.text).toContain("https://example.org/diaspora");
    expect(arg.text).toContain("Recent visit to Ghana");
  });
});
