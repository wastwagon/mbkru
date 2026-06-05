import Link from "next/link";

import { VoiceSubmissionPrimaryAction } from "@/components/accountability/VoiceSubmissionPrimaryAction";
import { formatMediumDate } from "@/lib/format-submission-datetime";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { reportStatusLabel } from "@/lib/report-status-text";
import type { MpPerformanceIntakeRow } from "@/lib/server/promises-member-sheet-load";
import { formatCompactEngagementSummary, formatDiscussionStatusSuffix, voiceTrackHref } from "@/lib/voice-submission-display";

type Props = {
  report: MpPerformanceIntakeRow;
  titleHeadingLevel?: "h3" | "h4";
  parliamentMember?: { name: string; slug: string } | null;
  showMpSheetLink?: boolean;
};

/** Shared compact row for MP performance intakes (MP sheet list + parliament tracker). */
export function VoiceMpPerformanceIntakeRow({
  report,
  titleHeadingLevel = "h3",
  parliamentMember = null,
  showMpSheetLink = false,
}: Props) {
  const TitleTag = titleHeadingLevel;
  const titleId = `mp-intake-title-${report.id}`;
  const metaId = `mp-intake-meta-${report.id}`;
  const trackHref = voiceTrackHref(report.trackingCode);
  const engagementSummary = formatCompactEngagementSummary(
    report.publicSupportCount,
    report.publicCommentCount,
    report.discussionReactionTotals,
  );

  return (
    <article aria-labelledby={titleId} className="py-3 first:pt-0 last:pb-0">
      <TitleTag id={titleId} className="font-medium text-[var(--foreground)]">
        {report.title}
      </TitleTag>
      <p id={metaId} className="mt-1 text-xs text-[var(--muted-foreground)]">
        {reportStatusLabel(report.status)}
        {" · "}
        {formatMediumDate(report.createdAt)}
        {" · "}
        <Link href={trackHref} className={`tabular-nums ${primaryLinkClass}`}>
          {report.trackingCode}
        </Link>
        {formatDiscussionStatusSuffix(report.discussionEnabled)}
        <span className="sr-only"> — tracking code for {report.title}</span>
      </p>
      {parliamentMember ? (
        <p className="mt-1 text-xs font-medium text-[var(--foreground)]">
          MP in focus:{" "}
          {showMpSheetLink ? (
            <Link href={`/promises/${encodeURIComponent(parliamentMember.slug)}`} className={primaryLinkClass}>
              {parliamentMember.name}
            </Link>
          ) : (
            parliamentMember.name
          )}
        </p>
      ) : null}
      {engagementSummary ? (
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{engagementSummary}</p>
      ) : null}
      {report.bodyPreview ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{report.bodyPreview}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <VoiceSubmissionPrimaryAction
          reportId={report.id}
          trackingCode={report.trackingCode}
          title={report.title}
          discussionEnabled={report.discussionEnabled}
          describedBy={`${titleId} ${metaId}`}
        />
      </div>
    </article>
  );
}
