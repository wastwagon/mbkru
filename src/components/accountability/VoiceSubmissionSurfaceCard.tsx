import Link from "next/link";

import { VoiceSubmissionPrimaryAction } from "@/components/accountability/VoiceSubmissionPrimaryAction";
import { formatMediumDate } from "@/lib/format-submission-datetime";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel, reportStatusLabel } from "@/lib/report-status-text";
import {
  excludeTrainingDataFromPublicSurfaces,
  isTrainingCitizenReport,
} from "@/lib/reports/training-data";
import { kindBadgeClass } from "@/lib/voice-submission-card-shared";
import {
  formatCompactEngagementSummary,
  formatDiscussionStatusSuffix,
  type VoiceDiscussionReactionTotals,
  voiceTrackHref,
} from "@/lib/voice-submission-display";
import type { CitizenReportKind, CitizenReportStatus } from "@prisma/client";

export type VoiceSubmissionSurfaceCardProps = {
  id: string;
  title: string;
  trackingCode: string;
  status: CitizenReportStatus;
  createdAt: Date;
  discussionEnabled: boolean;
  kind: CitizenReportKind;
  titleHeadingLevel?: "h2" | "h3";
  narrative?: string | null;
  publishedTitle?: string | null;
  contextLine?: string | null;
  contextLink?: { href: string; label: string } | null;
  contextSuffix?: string | null;
  publicSupportCount: number;
  publicCommentCount: number;
  discussionReactionTotals: VoiceDiscussionReactionTotals;
  legacyCauseSlug?: string | null;
  staffSummaryPending?: boolean;
};

const secondaryText = "text-[var(--foreground-secondary)]";
const metaText = `mt-2 text-xs leading-relaxed ${secondaryText} sm:text-sm`;

export function VoiceSubmissionSurfaceCard({
  id,
  title,
  trackingCode,
  status,
  createdAt,
  discussionEnabled,
  kind,
  titleHeadingLevel = "h2",
  narrative = null,
  publishedTitle = null,
  contextLine = null,
  contextLink = null,
  contextSuffix = null,
  publicSupportCount,
  publicCommentCount,
  discussionReactionTotals,
  legacyCauseSlug = null,
  staffSummaryPending = false,
}: VoiceSubmissionSurfaceCardProps) {
  const TitleTag = titleHeadingLevel;
  const titleId = `voice-surface-title-${id}`;
  const metaId = `voice-surface-meta-${id}`;
  const showPublishedTitle = Boolean(publishedTitle && publishedTitle !== title);
  const engagementSummary = formatCompactEngagementSummary(
    publicSupportCount,
    publicCommentCount,
    discussionReactionTotals,
  );
  const trackHref = voiceTrackHref(trackingCode);
  const showTrainingBadge =
    !excludeTrainingDataFromPublicSurfaces() &&
    isTrainingCitizenReport({ trackingCode, title });

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition-shadow hover:border-[var(--primary)]/30 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex max-w-full rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-tight ${kindBadgeClass(kind)}`}
        >
          {reportKindLabel(kind)}
        </span>
        {showTrainingBadge ? (
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold leading-tight text-amber-900">
            Training data
          </span>
        ) : null}
      </div>

      <TitleTag
        id={titleId}
        className="mt-2.5 font-display text-base font-semibold leading-snug text-[var(--foreground)] sm:mt-3 sm:text-lg"
      >
        {title}
      </TitleTag>

      <p id={metaId} className={metaText}>
        {reportStatusLabel(status)}
        {" · "}
        {formatMediumDate(createdAt)}
        {" · "}
        <Link href={trackHref} className={`tabular-nums ${primaryLinkClass}`}>
          {trackingCode}
        </Link>
        {formatDiscussionStatusSuffix(discussionEnabled)}
      </p>

      {contextLine || contextLink || contextSuffix ? (
        <p className={`mt-1.5 line-clamp-1 text-xs ${secondaryText}`}>
          {contextLink ? (
            <>
              <Link href={contextLink.href} className={`font-medium ${primaryLinkClass}`}>
                {contextLink.label}
              </Link>
              {contextSuffix ? ` · ${contextSuffix}` : null}
            </>
          ) : (
            contextLine
          )}
        </p>
      ) : null}

      {showPublishedTitle ? (
        <p className={`mt-2 line-clamp-1 text-xs ${secondaryText}`}>
          Published as: <span className="font-medium text-[var(--foreground)]">{publishedTitle}</span>
        </p>
      ) : null}

      {narrative ? (
        <p className={`mt-2.5 line-clamp-2 text-sm leading-relaxed ${secondaryText}`}>{narrative}</p>
      ) : staffSummaryPending ? (
        <p className={`mt-2.5 line-clamp-2 text-sm italic ${secondaryText}`}>Staff summary pending publication.</p>
      ) : null}

      {engagementSummary ? (
        <p className={`mt-2.5 text-xs ${secondaryText}`}>{engagementSummary}</p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:mt-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:border-t sm:border-[var(--border)]/80 sm:pt-4">
        <VoiceSubmissionPrimaryAction
          reportId={id}
          trackingCode={trackingCode}
          title={title}
          discussionEnabled={discussionEnabled}
          describedBy={`${titleId} ${metaId}`}
        />
        {legacyCauseSlug ? (
          <Link
            href={`/citizens-voice/causes/${encodeURIComponent(legacyCauseSlug)}`}
            className={`text-center text-xs font-semibold sm:text-left ${primaryLinkClass}`}
            prefetch={false}
          >
            Legacy thread →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
