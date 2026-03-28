import "server-only";

import { Resend } from "resend";

import type { CitizenReportKind, CitizenReportStatus } from "@prisma/client";

function kindLabel(kind: CitizenReportKind): string {
  switch (kind) {
    case "VOICE":
      return "MBKRU Voice";
    case "SITUATIONAL_ALERT":
      return "Situational alert";
    case "ELECTION_OBSERVATION":
      return "Election observation";
    default:
      return kind;
  }
}

function statusLabel(status: CitizenReportStatus): string {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Notifies submitter when staff changes report status (Resend optional).
 */
export async function sendReportStatusNotification(params: {
  to: string;
  trackingCode: string;
  kind: CitizenReportKind;
  status: CitizenReportStatus;
}): Promise<{ mode: "sent" | "skipped" | "failed"; detail?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "MBKRU <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[report-status] RESEND_API_KEY unset — skip email to", params.to);
    return { mode: "skipped" };
  }

  const resend = new Resend(apiKey);
  const subject = `[MBKRU] Update on your report (${params.trackingCode})`;
  const text = [
    `Your ${kindLabel(params.kind)} submission has a status update.`,
    "",
    `Tracking code: ${params.trackingCode}`,
    `Status: ${statusLabel(params.status)}`,
    "",
    "You can check the latest status on our website using your tracking code (where available).",
    "",
    "— MBKRU Advocates",
  ].join("\n");

  const { data, error } = await resend.emails.send({
    from,
    to: [params.to],
    subject,
    text,
  });

  if (error) {
    console.error("[report-status] Resend error:", error);
    return { mode: "failed", detail: error.message };
  }

  console.info("[report-status] sent", data?.id ?? "");
  return { mode: "sent" };
}
