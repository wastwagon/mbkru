import "server-only";

import type { CitizenReportIntakeSource } from "@prisma/client";

import { suggestIndexCFromRubric } from "@/lib/mp-rubric-index-c";

export type ReportCardEditorialHint = {
  parliamentMemberId: string;
  parliamentMemberName: string;
  suggestedNarrative: string;
  suggestedIndexC: number | null;
  intakeLabel: string;
  trackingCode: string;
};

export function buildReportCardEditorialHint(report: {
  trackingCode: string;
  title: string;
  body: string;
  intakeSource: CitizenReportIntakeSource;
  experienceVerificationTier: string;
  mpPerformanceRubric: unknown;
  staffNotes: string | null;
  parliamentMember: { id: string; name: string } | null;
  community: { name: string } | null;
}): ReportCardEditorialHint | null {
  if (!report.parliamentMember) return null;

  const intakeLabel =
    report.intakeSource === "COUNCIL_EVALUATION"
      ? `Council evaluation (${report.experienceVerificationTier.replace(/_/g, " ")})`
      : `Citizen Voice (${report.experienceVerificationTier.replace(/_/g, " ")})`;

  const communityLine = report.community ? `Community: ${report.community.name}.` : "";

  const excerpt = report.body.trim().slice(0, 1200);
  const suggestedNarrative = [
    `[Editorial input from ${intakeLabel} — report ${report.trackingCode}]`,
    communityLine,
    report.staffNotes?.trim() ? `Staff notes: ${report.staffNotes.trim().slice(0, 400)}` : "",
    "",
    excerpt,
    report.body.length > 1200 ? "\n[…truncated for scorecard draft…]" : "",
  ]
    .filter(Boolean)
    .join("\n")
    .trim();

  return {
    parliamentMemberId: report.parliamentMember.id,
    parliamentMemberName: report.parliamentMember.name,
    suggestedNarrative,
    suggestedIndexC: suggestIndexCFromRubric(report.mpPerformanceRubric),
    intakeLabel,
    trackingCode: report.trackingCode,
  };
}
