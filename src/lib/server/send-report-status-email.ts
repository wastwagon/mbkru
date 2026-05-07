import "server-only";

import { Resend } from "resend";

import { runWithNotificationRetries } from "@/lib/server/notification-retry";
import { buildReportStatusEmailBody } from "@/lib/report-status-text";
import type { CitizenReportKind, CitizenReportStatus } from "@prisma/client";

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
  const text = buildReportStatusEmailBody({
    kind: params.kind,
    status: params.status,
    trackingCode: params.trackingCode,
  });

  const { data, error } = await runWithNotificationRetries("report-status-email", () =>
    resend.emails.send({
      from,
      to: [params.to],
      subject,
      text,
    }),
  );

  if (error) {
    console.error("[report-status] Resend error:", error);
    return { mode: "failed", detail: error.message };
  }

  console.info("[report-status] sent", data?.id ?? "");
  return { mode: "sent" };
}
