import Link from "next/link";

import { primaryLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel, reportStatusLabel } from "@/lib/report-status-text";
import type { VoiceSubmissionBrowseRow } from "@/lib/server/accountability-cache";
import type { CitizenReportKind } from "@prisma/client";

function excerptFromSummary(raw: string | null, max = 220): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
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
  const hasEngagement = Boolean(row.publicCauseSlug);

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
          <h2 className="font-display text-lg font-semibold leading-snug text-[var(--foreground)]">{row.title}</h2>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {reportStatusLabel(row.status)}
            {" · "}
            {dateLabel}
          </p>
          {place ? <p className="mt-2 text-xs text-[var(--muted-foreground)]">{place}</p> : null}
          {row.parliamentMember ? (
            <p className="mt-2 text-xs font-medium text-[var(--foreground)]">
              MP / figure in focus: {row.parliamentMember.name}
              {row.parliamentMember.role ? ` (${row.parliamentMember.role})` : ""}
            </p>
          ) : row.kind === "MP_PERFORMANCE" ? (
            <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
              No parliament roster link on this row — pick an MP when submitting so tracking stays clear.
            </p>
          ) : null}
        </div>
        {hasEngagement ? (
          <span className="shrink-0 rounded-full bg-[var(--primary)]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--primary)]">
            Public thread
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-[var(--muted)]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Private narrative
          </span>
        )}
      </div>
      {hasEngagement ? (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Community engagement: {row.publicSupportCount} supporter{row.publicSupportCount === 1 ? "" : "s"}
          {" · "}
          {row.publicCommentCount} comment{row.publicCommentCount === 1 ? "" : "s"}
        </p>
      ) : null}
      {publicTitle ? (
        <p className="mt-3 text-xs font-medium text-[var(--foreground)]">Published title: {publicTitle}</p>
      ) : null}
      {summaryExcerpt ? (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{summaryExcerpt}</p>
      ) : row.publicCauseSlug ? (
        <p className="mt-3 flex-1 text-sm italic text-[var(--muted-foreground)]">
          Staff-approved summary will appear here when published.
        </p>
      ) : (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
          Original narrative stays private. Members can <strong className="font-semibold">support and comment</strong> only on
          threads staff open as a <strong className="font-semibold">public cause</strong> — then sign in on that thread page.
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)]/80 pt-4 text-sm">
        {row.publicCauseSlug ? (
          <Link
            href={`/citizens-voice/causes/${encodeURIComponent(row.publicCauseSlug)}`}
            className={`${primaryLinkClass} font-semibold`}
            prefetch={false}
          >
            Open public thread (support &amp; comments) →
          </Link>
        ) : null}
        <Link href="/track-report" className={`${primaryLinkClass} font-semibold`} prefetch={false}>
          Track a report
        </Link>
      </div>
    </article>
  );
}
