import Link from "next/link";

import { VoiceSubmissionEngagementMeta } from "@/components/accountability/VoiceSubmissionEngagementMeta";
import { VoiceSubmissionPrimaryAction } from "@/components/accountability/VoiceSubmissionPrimaryAction";
import { formatMediumDate } from "@/lib/format-submission-datetime";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";
import { reportKindLabel, reportStatusLabel } from "@/lib/report-status-text";
import type { VoiceSubmissionBrowseRow } from "@/lib/server/accountability-cache";
import { formatDiscussionStatusSuffix, voiceTrackHref } from "@/lib/voice-submission-display";
import type { CitizenReportKind } from "@prisma/client";

function excerptFromSummary(raw: string | null, max = 220): string | null {
  if (!raw?.trim()) return null;
  let t = raw.trim().replace(/\s+/g, " ");
  t = t.replace(/\s+—\s*not a live case\.?$/i, "").replace(/\bSeed data[^.]*\.?\s*/gi, "").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
}

/** Hide demo/seed suffixes in browse titles without changing stored data. */
function stripSeedMarkers(title: string): string {
  let s = title.trim();
  s = s.replace(/\s*\(seed\)\s*$/i, "").replace(/\s*[—–-]\s*seed\s*$/i, "").trim();
  return s;
}

function kindBadgeClass(kind: CitizenReportKind): string {
  switch (kind) {
    case "MP_PERFORMANCE":
      return "border-[var(--primary)]/40 bg-[var(--primary)]/12 text-[var(--primary)]";
    case "GOVERNMENT_PERFORMANCE":
      return "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100";
    case "ELECTION_OBSERVATION":
      return "border-violet-500/30 bg-violet-500/10 text-violet-950 dark:text-violet-100";
    case "SITUATIONAL_ALERT":
      return "border-orange-500/30 bg-orange-500/10 text-orange-950 dark:text-orange-100";
    default:
      return "border-[var(--border)] bg-[var(--section-light)] text-[var(--foreground)]";
  }
}

type Props = {
  row: VoiceSubmissionBrowseRow;
};

export function VoiceSubmissionBrowseCard({ row }: Props) {
  const titleId = `voice-browse-title-${row.id}`;
  const metaId = `voice-browse-meta-${row.id}`;
  const placeParts = [row.region?.name, row.localArea?.trim()].filter(Boolean);
  const place = placeParts.length > 0 ? placeParts.join(" · ") : null;
  const summaryExcerpt = excerptFromSummary(row.publicCauseSummary);
  const publicTitle = row.publicCauseTitle?.trim() ?? null;
  const hasLegacyCause = Boolean(row.publicCauseSlug);
  const discussionOpen = row.discussionEnabled;
  const displayTitle = stripSeedMarkers(row.title);
  const showMpSheetLink = isPromisesBrowseEnabled();

  const narrative =
    summaryExcerpt ??
    (row.kind === "MP_PERFORMANCE" && row.bodyPreview
      ? row.bodyPreview
      : !hasLegacyCause && discussionOpen && row.bodyPreview
        ? row.bodyPreview
        : null);

  const narrativeFallback = discussionOpen
    ? "Open the report to read the full narrative. Sign in on the discussion page to comment, react, and show support."
    : "Public discussion is turned off for this submission.";

  const trackHref = voiceTrackHref(row.trackingCode);

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <p className="mb-2">
          <span
            className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-xs font-semibold leading-tight ${kindBadgeClass(row.kind)}`}
          >
            Report type: {reportKindLabel(row.kind)}
          </span>
        </p>
        <h2 id={titleId} className="font-display text-lg font-semibold leading-snug text-[var(--foreground)]">
          {displayTitle}
        </h2>
        {row.submitterLabel ? (
          <p className="mt-2 text-xs font-medium text-[var(--foreground)]">Submitted by {row.submitterLabel}</p>
        ) : null}
        <p id={metaId} className="mt-2 text-xs text-[var(--muted-foreground)]">
          {reportStatusLabel(row.status)}
          {" · "}
          {formatMediumDate(row.createdAt)}
          {" · "}
          <Link href={trackHref} className={`tabular-nums ${primaryLinkClass}`}>
            {row.trackingCode}
          </Link>
          {formatDiscussionStatusSuffix(discussionOpen)}
        </p>
        {place ? <p className="mt-2 text-xs text-[var(--muted-foreground)]">{place}</p> : null}
        {row.parliamentMember ? (
          <p className="mt-2 text-xs font-medium text-[var(--foreground)]">
            MP in focus:{" "}
            {showMpSheetLink ? (
              <Link href={`/promises/${encodeURIComponent(row.parliamentMember.slug)}`} className={primaryLinkClass}>
                {row.parliamentMember.name}
              </Link>
            ) : (
              row.parliamentMember.name
            )}
            {row.parliamentMember.role ? ` (${row.parliamentMember.role})` : ""}
          </p>
        ) : row.kind === "MP_PERFORMANCE" ? (
          <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
            No MP selected on this intake — when you file MP performance, pick the sitting MP so it appears on their
            tracker sheet.
          </p>
        ) : null}
      </div>
      <VoiceSubmissionEngagementMeta
        engagement={{
          publicSupportCount: row.publicSupportCount,
          publicCommentCount: row.publicCommentCount,
          discussionReactionTotals: row.discussionReactionTotals,
        }}
        className="mt-3 text-xs text-[var(--muted-foreground)]"
      />
      {publicTitle ? (
        <p className="mt-3 line-clamp-2 text-xs font-medium text-[var(--foreground)]">Published title: {publicTitle}</p>
      ) : null}
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        {narrative ? (
          <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{narrative}</p>
        ) : hasLegacyCause ? (
          <p className="line-clamp-4 flex-1 text-sm italic text-[var(--muted-foreground)]">
            Staff-approved summary will appear here when published.
          </p>
        ) : (
          <p className="line-clamp-4 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{narrativeFallback}</p>
        )}
      </div>
      <div className="mt-auto mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)]/80 pt-4 text-sm">
        <VoiceSubmissionPrimaryAction
          reportId={row.id}
          trackingCode={row.trackingCode}
          title={displayTitle}
          discussionEnabled={discussionOpen}
          describedBy={`${titleId} ${metaId}`}
        />
        {row.publicCauseSlug ? (
          <Link
            href={`/citizens-voice/causes/${encodeURIComponent(row.publicCauseSlug)}`}
            className={`${primaryLinkClass} font-semibold`}
            prefetch={false}
          >
            Legacy public cause thread →
          </Link>
        ) : null}
      </div>
    </article>
  );
}
