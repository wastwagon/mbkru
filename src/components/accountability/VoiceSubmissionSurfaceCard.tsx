import Link from "next/link";

import { VoiceSubmissionPrimaryAction } from "@/components/accountability/VoiceSubmissionPrimaryAction";
import { formatMediumDate } from "@/lib/format-submission-datetime";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel, reportStatusLabel } from "@/lib/report-status-text";
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

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
    >
      <span
        className={`inline-flex max-w-full self-start rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-tight ${kindBadgeClass(kind)}`}
      >
        {reportKindLabel(kind)}
      </span>

      <TitleTag id={titleId} className="mt-3 font-display text-lg font-semibold leading-snug text-[var(--foreground)]">
        {title}
      </TitleTag>

      <p id={metaId} className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
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
        <p className="mt-1.5 line-clamp-1 text-xs text-[var(--muted-foreground)]">
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
        <p className="mt-2 line-clamp-1 text-xs text-[var(--muted-foreground)]">
          Published as: <span className="text-[var(--foreground)]">{publishedTitle}</span>
        </p>
      ) : null}

      {narrative ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{narrative}</p>
      ) : staffSummaryPending ? (
        <p className="mt-3 line-clamp-2 text-sm italic text-[var(--muted-foreground)]">Staff summary pending publication.</p>
      ) : null}

      {engagementSummary ? (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">{engagementSummary}</p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)]/80 pt-4 text-sm">
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
            className={`${primaryLinkClass} text-xs font-semibold`}
            prefetch={false}
          >
            Legacy thread →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
