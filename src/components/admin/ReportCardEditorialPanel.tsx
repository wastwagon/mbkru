import Link from "next/link";

import type { ReportCardEditorialHint } from "@/lib/server/report-card-editorial-hint";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type Props = {
  hint: ReportCardEditorialHint;
  cycleId: string | null;
  reportId: string;
};

export function ReportCardEditorialPanel({ hint, cycleId, reportId }: Props) {
  const params = new URLSearchParams({
    memberId: hint.parliamentMemberId,
    fromReportId: reportId,
  });
  if (hint.suggestedIndexC != null) {
    params.set("indexCScore", String(hint.suggestedIndexC));
  }

  const href = cycleId
    ? `/admin/report-card/${encodeURIComponent(cycleId)}?${params.toString()}`
    : `/admin/report-card?${params.toString()}`;

  return (
    <div className="mt-8 rounded-xl border border-[var(--accent-gold)]/35 bg-[var(--accent-gold-light)]/20 p-5">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">People&apos;s Report Card — editorial shortcut</h2>
      <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
        Prefill a scorecard draft from this {hint.intakeLabel.toLowerCase()} signal. Staff still review and publish
        officially on the Report Card.
      </p>
      <dl className="mt-4 grid gap-1 text-xs text-[var(--foreground-secondary)]">
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">MP: </dt>
          <dd className="inline">{hint.parliamentMemberName}</dd>
        </div>
        {hint.suggestedIndexC != null ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Suggested Index C: </dt>
            <dd className="inline tabular-nums">{hint.suggestedIndexC}</dd>
            <span className="ml-1 text-[var(--foreground-secondary)]">(from rubric average)</span>
          </div>
        ) : null}
      </dl>
      <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-xs text-[var(--foreground-secondary)]">
        {hint.suggestedNarrative.slice(0, 400)}
        {hint.suggestedNarrative.length > 400 ? "…" : ""}
      </p>
      <Link href={href} className={`${primaryLinkClass} mt-4 inline-block text-sm font-semibold`}>
        Open scorecard editor with prefilled draft →
      </Link>
      {!cycleId ? (
        <p className="mt-2 text-[11px] text-amber-800">No report card cycle exists yet — create one first.</p>
      ) : null}
    </div>
  );
}
