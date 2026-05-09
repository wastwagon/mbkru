import Link from "next/link";

import { primaryLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel, reportStatusLabel } from "@/lib/report-status-text";
import type { VoiceSubmissionBrowseRow } from "@/lib/server/accountability-cache";
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
  const dateLabel = row.createdAt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const placeParts = [row.region?.name, row.localArea?.trim()].filter(Boolean);
  const place = placeParts.length > 0 ? placeParts.join(" · ") : null;
  const summaryExcerpt = excerptFromSummary(row.publicCauseSummary);
  const publicTitle = row.publicCauseTitle?.trim() ?? null;
  const hasLegacyCause = Boolean(row.publicCauseSlug);
  const discussionOpen = row.discussionEnabled;
  const displayTitle = stripSeedMarkers(row.title);
  const rt = row.discussionReactionTotals;
  const reactionLine =
    rt.LIKE + rt.THANK + rt.INSIGHT > 0
      ? `On the discussion thread: Like ${rt.LIKE} · Thanks ${rt.THANK} · Important ${rt.INSIGHT}`
      : null;

  const narrative =
    summaryExcerpt ??
    (row.kind === "MP_PERFORMANCE" && row.bodyPreview
      ? row.bodyPreview
      : !hasLegacyCause && discussionOpen && row.bodyPreview
        ? row.bodyPreview
        : null);

  return (
    <article className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-2">
            <span
              className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-xs font-semibold leading-tight ${kindBadgeClass(row.kind)}`}
            >
              Report type: {reportKindLabel(row.kind)}
            </span>
          </p>
          <h2 className="font-display text-lg font-semibold leading-snug text-[var(--foreground)]">{displayTitle}</h2>
          {row.submitterLabel ? (
            <p className="mt-2 text-xs font-medium text-[var(--foreground)]">Submitted by {row.submitterLabel}</p>
          ) : null}
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {reportStatusLabel(row.status)}
            {" · "}
            {dateLabel}
          </p>
          {place ? <p className="mt-2 text-xs text-[var(--muted-foreground)]">{place}</p> : null}
          {row.parliamentMember ? (
            <p className="mt-2 text-xs font-medium text-[var(--foreground)]">
              MP in focus: {row.parliamentMember.name}
              {row.parliamentMember.role ? ` (${row.parliamentMember.role})` : ""}
            </p>
          ) : row.kind === "MP_PERFORMANCE" ? (
            <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
              No MP selected on this intake — when you file MP performance, pick the sitting MP so it appears on their
              tracker sheet.
            </p>
          ) : null}
        </div>
        {discussionOpen ? (
          <span className="shrink-0 rounded-full bg-[var(--primary)]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--primary)]">
            Discussion open
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-[var(--muted)]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Discussion off
          </span>
        )}
      </div>
      {row.publicSupportCount > 0 || row.publicCommentCount > 0 ? (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Community engagement: {row.publicSupportCount} supporter{row.publicSupportCount === 1 ? "" : "s"}
          {" · "}
          {row.publicCommentCount} comment{row.publicCommentCount === 1 ? "" : "s"}
        </p>
      ) : null}
      {publicTitle ? (
        <p className="mt-3 text-xs font-medium text-[var(--foreground)]">Published title: {publicTitle}</p>
      ) : null}
      {narrative ? (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{narrative}</p>
      ) : hasLegacyCause ? (
        <p className="mt-3 flex-1 text-sm italic text-[var(--muted-foreground)]">
          Staff-approved summary will appear here when published.
        </p>
      ) : discussionOpen ? (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
          Open the report to read the full narrative. Sign in on the discussion page to comment, react, and show
          support.
        </p>
      ) : (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
          Public discussion is turned off for this submission.
        </p>
      )}
      {discussionOpen && reactionLine ? (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">{reactionLine}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)]/80 pt-4 text-sm">
        {discussionOpen ? (
          <Link
            href={`/citizens-voice/discussions/${encodeURIComponent(row.id)}`}
            className={`${primaryLinkClass} font-semibold`}
            prefetch={false}
          >
            Full report &amp; discussion →
          </Link>
        ) : null}
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
