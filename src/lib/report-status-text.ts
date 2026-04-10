import type { CitizenReportKind, CitizenReportStatus } from "@prisma/client";

export function reportKindLabel(kind: CitizenReportKind): string {
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

export function reportStatusLabel(status: CitizenReportStatus): string {
  return status
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/** Plain text body for email (multi-line). */
export function buildReportStatusEmailBody(params: {
  kind: CitizenReportKind;
  status: CitizenReportStatus;
  trackingCode: string;
}): string {
  return [
    `Your ${reportKindLabel(params.kind)} submission has a status update.`,
    "",
    `Tracking code: ${params.trackingCode}`,
    `Status: ${reportStatusLabel(params.status)}`,
    "",
    "You can check the latest status on our website using your tracking code (where available).",
    "",
    "— MBKRU Advocates",
  ].join("\n");
}

/** Short single SMS (GSM-safe, under typical SMS segment limits). */
export function buildReportStatusSmsBody(params: {
  kind: CitizenReportKind;
  status: CitizenReportStatus;
  trackingCode: string;
}): string {
  return `MBKRU: ${reportKindLabel(params.kind)} report ${params.trackingCode} is now ${reportStatusLabel(params.status)}.`;
}

/** SMS when staff posts or updates a submitter-visible note (no message body — use Track / email for detail). */
export function buildReportAdminReplySmsBody(params: {
  kind: CitizenReportKind;
  trackingCode: string;
  isUpdate?: boolean;
}): string {
  const verb = params.isUpdate ? "Updated team note" : "New team note";
  return `MBKRU: ${verb} on ${reportKindLabel(params.kind)} ${params.trackingCode}. Check Track a report or your email.`;
}

/** Email when a previously hidden team note is shown to the submitter again. */
export function buildReportAdminReplyVisibleAgainEmailBody(params: {
  kind: CitizenReportKind;
  trackingCode: string;
}): string {
  return [
    `A team note on your ${reportKindLabel(params.kind)} submission is visible again on the MBKRU site.`,
    "",
    `Tracking code: ${params.trackingCode}`,
    "",
    "Open Track a report with this code, or My reports if you submitted while signed in, to read the note.",
    "",
    "— MBKRU Advocates",
  ].join("\n");
}

export function buildReportAdminReplyVisibleAgainSmsBody(params: {
  kind: CitizenReportKind;
  trackingCode: string;
}): string {
  return `MBKRU: Team note visible again on ${reportKindLabel(params.kind)} ${params.trackingCode}. Track a report or My reports.`;
}

/** Plain text body when staff posts or updates a submitter-visible note (multi-line). */
export function buildReportAdminReplyEmailBody(params: {
  kind: CitizenReportKind;
  trackingCode: string;
  replyBody: string;
  isUpdate?: boolean;
}): string {
  const lead = params.isUpdate
    ? `Your ${reportKindLabel(params.kind)} submission has an updated note from the MBKRU team.`
    : `Your ${reportKindLabel(params.kind)} submission has a new note from the MBKRU team.`;
  return [
    lead,
    "",
    `Tracking code: ${params.trackingCode}`,
    "",
    "Message:",
    params.replyBody.trim(),
    "",
    "You can review all team notes using your tracking code on the website (Track a report), or in your account if you submitted while signed in.",
    "",
    "— MBKRU Advocates",
  ].join("\n");
}
