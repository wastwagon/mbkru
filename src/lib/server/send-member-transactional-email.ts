import "server-only";

import { Resend } from "resend";

import { runWithNotificationRetries } from "@/lib/server/notification-retry";

/**
 * Plain transactional email for members (community alerts, etc.).
 * Mirrors report-status email behaviour: skip when `RESEND_API_KEY` unset.
 */
export async function sendMemberTransactionalEmail(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ mode: "sent" | "skipped" | "failed"; detail?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "MBKRU <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[member-transactional-email] RESEND_API_KEY unset — skip email to", params.to);
    return { mode: "skipped" };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await runWithNotificationRetries("member-transactional-email", () =>
    resend.emails.send({
      from,
      to: [params.to],
      subject: params.subject,
      text: params.text,
    }),
  );

  if (error) {
    console.error("[member-transactional-email] Resend error:", error);
    return { mode: "failed", detail: error.message };
  }

  console.info("[member-transactional-email] sent", data?.id ?? "");
  return { mode: "sent" };
}
