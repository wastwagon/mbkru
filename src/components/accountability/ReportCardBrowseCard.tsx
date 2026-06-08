import Link from "next/link";

import { focusRingSmClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import type { ReportCardBrowseRow } from "@/lib/server/accountability-cache";

function excerptFromNarrative(raw: string | null, max = 200): string | null {
  if (!raw?.trim()) return null;
  const t = raw.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
}

type Props = {
  year: number;
  row: ReportCardBrowseRow;
};

export function ReportCardBrowseCard({ year, row }: Props) {
  const { member: m } = row;
  const place =
    m.constituency != null
      ? `${m.constituency.name} · ${m.constituency.region.name}`
      : "Constituency not linked";
  const excerpt = excerptFromNarrative(row.narrative);
  const reportHref = `/report-card/${year}?mp=${encodeURIComponent(m.slug)}`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/35 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold leading-snug text-[var(--foreground)] sm:text-lg">
            <Link href={reportHref} className="hover:text-[var(--primary)]" prefetch={false}>
              {m.name}
            </Link>
          </h2>
          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
            {m.role}
            {m.party ? ` · ${m.party}` : ""}
          </p>
          <p className="mt-2 text-xs text-[var(--foreground-secondary)]">{place}</p>
        </div>
        {row.overallScore != null ? (
          <span className="shrink-0 rounded-full border border-[var(--accent-gold)]/35 bg-[var(--accent-gold-light)] px-3 py-1 text-sm font-semibold tabular-nums text-[var(--accent-gold)]">
            {row.overallScore}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-[var(--section-light-alt)] px-3 py-1 text-[11px] font-semibold text-[var(--foreground-secondary)]">
            Pending
          </span>
        )}
      </div>
      {excerpt ? (
        <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--foreground-secondary)]">{excerpt}</p>
      ) : (
        <p className="mt-4 flex-1 text-sm italic text-[var(--foreground-secondary)]">No narrative published yet.</p>
      )}
      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/promises/${encodeURIComponent(m.slug)}`} className={`text-sm ${primaryNavLinkClass}`} prefetch={false}>
          Commitments
        </Link>
        <Link
          href={reportHref}
          className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`}
          prefetch={false}
        >
          Full report card
        </Link>
      </div>
    </article>
  );
}
