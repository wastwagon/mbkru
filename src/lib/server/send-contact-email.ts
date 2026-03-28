import "server-only";

import { Resend } from "resend";

export type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
  enquiryType?: string;
};

/**
 * Sends contact notification via Resend when RESEND_API_KEY + CONTACT_INBOX_EMAIL are set.
 * Otherwise logs only (dev / staging without email).
 */
export async function sendContactNotification(
  params: ContactPayload,
): Promise<{ mode: "sent" | "skipped" | "failed"; detail?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_INBOX_EMAIL?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "MBKRU Contact <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.info(
      "[contact] RESEND_API_KEY or CONTACT_INBOX_EMAIL unset — logging only",
    );
    console.info("[contact]", params);
    return { mode: "skipped" };
  }

  const resend = new Resend(apiKey);
  const lines = [
    `From: ${params.name} <${params.email}>`,
    params.enquiryType ? `Enquiry type: ${params.enquiryType}` : "",
    "",
    params.message,
  ].filter(Boolean);

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: params.email,
    subject: `[MBKRU Contact] ${params.subject}`,
    text: lines.join("\n"),
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return { mode: "failed", detail: error.message };
  }

  console.info("[contact] sent", data?.id ?? "");
  return { mode: "sent" };
}
