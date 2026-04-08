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
