import "server-only";

import { Resend } from "resend";

import { runWithNotificationRetries } from "@/lib/server/notification-retry";

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }
  return "https://mbkruadvocates.org";
}

function buildBody(params: {
  fullName: string;
  receivedAtIso: string;
  engagementLabel: string;
}): string {
  const base = siteOrigin();
  return [
    `Dear ${params.fullName},`,
    "",
    "Thank you for submitting diaspora feedback to MBKRU.",
    "",
    `We received your form on ${params.receivedAtIso} (server time, UTC). Path: ${params.engagementLabel}.`,
    "",
    "What happens next: we aim to acknowledge or follow up within five business days (Ghana / GMT).",
    "Urgent consular or immigration matters should still go to your official mission or .gov.gh channels — MBKRU uses this form for programme planning, not same-day consular service.",
    "",
    `Diaspora support hub: ${base}/diaspora`,
    `Methodology (accountability): ${base}/methodology`,
    "",
    "— MBKRU",
  ].join("\n");
}

/**
 * Optional acknowledgement email to the submitter after feedback is stored.
 * Uses the same `RESEND_API_KEY` / `RESEND_FROM_EMAIL` as other transactional mail.
 */
export async function sendDiasporaFeedbackAcknowledgement(params: {
  to: string;
  fullName: string;
  receivedAtIso: string;
  engagementKind: "RECENT_VISIT" | "ABROAD_SUPPORTER";
}): Promise<{ mode: "sent" | "skipped" | "failed"; detail?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "MBKRU <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[diaspora-feedback-ack] RESEND_API_KEY unset — skip email to", params.to);
    return { mode: "skipped" };
  }

  const engagementLabel =
    params.engagementKind === "ABROAD_SUPPORTER" ? "Engaging from abroad" : "Recent visit to Ghana";

  const resend = new Resend(apiKey);
  const subject = "[MBKRU] We received your diaspora feedback";
  const text = buildBody({
    fullName: params.fullName.trim(),
    receivedAtIso: params.receivedAtIso,
    engagementLabel,
  });

  const { data, error } = await runWithNotificationRetries("diaspora-feedback-ack-email", () =>
    resend.emails.send({
      from,
      to: [params.to.trim()],
      subject,
      text,
    }),
  );

  if (error) {
    console.error("[diaspora-feedback-ack] Resend error:", error);
    return { mode: "failed", detail: error.message };
  }

  console.info("[diaspora-feedback-ack] sent", data?.id ?? "");
  return { mode: "sent" };
}
