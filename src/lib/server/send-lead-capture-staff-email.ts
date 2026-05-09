import "server-only";

import type { LeadCaptureSource } from "@prisma/client";
import { Resend } from "resend";

const SOURCE_LABEL: Record<LeadCaptureSource, string> = {
  PARLIAMENT_TRACKER: "Parliamentarians tracker waitlist",
  EARLY_ACCESS: "Early access / pilot",
  NEWSLETTER: "Newsletter",
};

export type LeadCaptureNotifyPayload = {
  source: LeadCaptureSource;
  email: string;
};

/**
 * Optional staff ping when `LEADS_STAFF_INBOX_EMAIL` + `RESEND_API_KEY` are set.
 * Does not block the public API — failures are logged only (Postgres remains source of truth).
 */
const STAFF_NOTIFY_SOURCES = new Set<LeadCaptureSource>(["PARLIAMENT_TRACKER", "EARLY_ACCESS"]);

export async function sendLeadCaptureStaffNotification(
  params: LeadCaptureNotifyPayload,
): Promise<{ mode: "sent" | "skipped" | "failed"; detail?: string }> {
  if (!STAFF_NOTIFY_SOURCES.has(params.source)) {
    return { mode: "skipped" };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.LEADS_STAFF_INBOX_EMAIL?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "MBKRU Leads <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return { mode: "skipped" };
  }

  const label = SOURCE_LABEL[params.source] ?? params.source;
  const resend = new Resend(apiKey);
  const lines = [
    `New lead capture`,
    `Source: ${label} (${params.source})`,
    `Email: ${params.email}`,
    "",
    "View all leads in Admin → Lead captures.",
  ];

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: `[MBKRU Lead] ${label}: ${params.email}`,
    text: lines.join("\n"),
  });

  if (error) {
    console.error("[leads-notify] Resend error:", error);
    return { mode: "failed", detail: error.message };
  }

  console.info("[leads-notify] sent", data?.id ?? "");
  return { mode: "sent" };
}
