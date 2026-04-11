import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("sendLeadCaptureStaffNotification", () => {
  it("skips newsletter source without calling Resend", async () => {
    const { sendLeadCaptureStaffNotification } = await import("./send-lead-capture-staff-email");
    const out = await sendLeadCaptureStaffNotification({
      source: "NEWSLETTER",
      email: "user@example.com",
    });
    expect(out).toEqual({ mode: "skipped" });
  });
});
