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

const secondaryText = "text-[var(--foreground-secondary)]";

/** Compact intake row for parliament tracker — matches Voice card typography. */
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
    <article
      aria-labelledby={titleId}
      className="rounded-xl border border-[var(--border)]/80 bg-[var(--section-light)]/60 px-3 py-3 first:mt-0 sm:bg-transparent sm:px-0 sm:py-3"
    >
      <TitleTag id={titleId} className="text-sm font-semibold leading-snug text-[var(--foreground)] sm:text-base">
        {report.title}
      </TitleTag>
      <p id={metaId} className={`mt-1 text-xs leading-relaxed ${secondaryText}`}>
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
        <p className={`mt-1 text-xs ${secondaryText}`}>
          MP in focus:{" "}
          {showMpSheetLink ? (
            <Link href={`/promises/${encodeURIComponent(parliamentMember.slug)}`} className={primaryLinkClass}>
              {parliamentMember.name}
            </Link>
          ) : (
            <span className="font-medium text-[var(--foreground)]">{parliamentMember.name}</span>
          )}
        </p>
      ) : null}
      {engagementSummary ? <p className={`mt-1 text-xs ${secondaryText}`}>{engagementSummary}</p> : null}
      {report.bodyPreview ? (
        <p className={`mt-2 line-clamp-2 text-sm leading-relaxed ${secondaryText}`}>{report.bodyPreview}</p>
      ) : null}
      <div className="mt-3">
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
