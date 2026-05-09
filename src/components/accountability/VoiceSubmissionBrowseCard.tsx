import Link from "next/link";

import { primaryLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel, reportStatusLabel } from "@/lib/report-status-text";
import type { VoiceSubmissionBrowseRow } from "@/lib/server/accountability-cache";

function excerptFromSummary(raw: string | null, max = 220): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
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

  return (
    <article className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold leading-snug text-[var(--foreground)]">{row.title}</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {reportKindLabel(row.kind)}
            {" · "}
            {reportStatusLabel(row.status)}
            {" · "}
            {dateLabel}
          </p>
          {place ? <p className="mt-2 text-xs text-[var(--muted-foreground)]">{place}</p> : null}
          {row.parliamentMember ? (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Linked figure: {row.parliamentMember.name}
              {row.parliamentMember.role ? ` (${row.parliamentMember.role})` : ""}
            </p>
          ) : null}
        </div>
        {row.publicCauseSlug ? (
          <span className="shrink-0 rounded-full bg-[var(--primary)]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--primary)]">
            Public thread
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-[var(--muted)]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Private narrative
          </span>
        )}
      </div>
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
        <p className="mt-3 flex-1 text-sm italic text-[var(--muted-foreground)]">
          Full account text is shared only with staff and the submitter (unless staff opens a public thread).
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)]/80 pt-4 text-sm">
        {row.publicCauseSlug ? (
          <Link
            href={`/citizens-voice/causes/${encodeURIComponent(row.publicCauseSlug)}`}
            className={`${primaryLinkClass} font-semibold`}
            prefetch={false}
          >
            Open public thread →
          </Link>
        ) : null}
        <Link href="/track-report" className={`${primaryLinkClass} font-semibold`} prefetch={false}>
          Track a report
        </Link>
      </div>
    </article>
  );
}
