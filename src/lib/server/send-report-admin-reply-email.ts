import "server-only";

import { Resend } from "resend";

import {
  buildReportAdminReplyEmailBody,
  buildReportAdminReplyVisibleAgainEmailBody,
} from "@/lib/report-status-text";
import type { CitizenReportKind } from "@prisma/client";

/**
 * Optional email when an admin posts a submitter-visible reply (Resend).
 */
export async function sendReportAdminReplyEmail(params: {
  to: string;
  trackingCode: string;
  kind: CitizenReportKind;
  replyBody: string;
  isUpdate?: boolean;
}): Promise<{ mode: "sent" | "skipped" | "failed"; detail?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "MBKRU <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[report-admin-reply] RESEND_API_KEY unset — skip email to", params.to);
    return { mode: "skipped" };
  }

  const resend = new Resend(apiKey);
  const subject = params.isUpdate
    ? `[MBKRU] Updated message on your report (${params.trackingCode})`
    : `[MBKRU] Message on your report (${params.trackingCode})`;
  const text = buildReportAdminReplyEmailBody({
    kind: params.kind,
    trackingCode: params.trackingCode,
    replyBody: params.replyBody,
    isUpdate: params.isUpdate,
  });

  const { data, error } = await resend.emails.send({
    from,
    to: [params.to],
    subject,
    text,
  });

  if (error) {
    console.error("[report-admin-reply] Resend error:", error);
    return { mode: "failed", detail: error.message };
  }

  console.info("[report-admin-reply] sent", data?.id ?? "");
  return { mode: "sent" };
}

/** Optional email when a hidden team note is shown again to the submitter. */
export async function sendReportAdminReplyVisibleAgainEmail(params: {
  to: string;
  trackingCode: string;
  kind: CitizenReportKind;
}): Promise<{ mode: "sent" | "skipped" | "failed"; detail?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "MBKRU <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[report-admin-reply-visible] RESEND_API_KEY unset — skip email to", params.to);
    return { mode: "skipped" };
  }

  const resend = new Resend(apiKey);
  const subject = `[MBKRU] Team note visible again (${params.trackingCode})`;
  const text = buildReportAdminReplyVisibleAgainEmailBody({
    kind: params.kind,
    trackingCode: params.trackingCode,
  });

  const { data, error } = await resend.emails.send({
    from,
    to: [params.to],
    subject,
    text,
  });

  if (error) {
    console.error("[report-admin-reply-visible] Resend error:", error);
    return { mode: "failed", detail: error.message };
  }

  console.info("[report-admin-reply-visible] sent", data?.id ?? "");
  return { mode: "sent" };
}
