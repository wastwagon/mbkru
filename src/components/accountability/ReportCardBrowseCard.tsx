import Link from "next/link";

import { primaryLinkClass } from "@/lib/primary-link-styles";
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

  return (
    <article className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold leading-snug text-[var(--foreground)]">{m.name}</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {m.role}
            {m.party ? ` · ${m.party}` : ""}
          </p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">{place}</p>
        </div>
        {row.overallScore != null ? (
          <span className="shrink-0 rounded-full bg-[var(--primary)]/12 px-3 py-1 text-sm font-semibold tabular-nums text-[var(--primary)]">
            {row.overallScore}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-[var(--muted)]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Pending
          </span>
        )}
      </div>
      {excerpt ? (
        <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{excerpt}</p>
      ) : (
        <p className="mt-4 flex-1 text-sm italic text-[var(--muted-foreground)]">No narrative published yet.</p>
      )}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)]/80 pt-4 text-sm">
        <Link
          href={`/report-card/${year}?mp=${encodeURIComponent(m.slug)}`}
          className={`${primaryLinkClass} font-semibold`}
          prefetch={false}
        >
          Full report card →
        </Link>
        <Link href={`/promises/${encodeURIComponent(m.slug)}`} className={primaryLinkClass} prefetch={false}>
          Commitments →
        </Link>
      </div>
    </article>
  );
}
