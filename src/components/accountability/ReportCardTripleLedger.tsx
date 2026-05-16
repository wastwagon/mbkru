import Link from "next/link";

import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { REPORT_CARD_HEADLINE_WEIGHTS, headlineFormulaNote } from "@/lib/report-card-headline";

type Props = {
  indexA: number | null;
  indexB: number | null;
  indexC: number | null;
  headline: number | null;
  compact?: boolean;
};

function fmt(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/**
 * Public display of Ghana triple ledger — indices are stored on a **commensurate 0–100 scale**
 * (editors normalise B/C before entry). Headline = weighted blend per `/methodology`.
 */
export function ReportCardTripleLedger({ indexA, indexB, indexC, headline, compact }: Props) {
  const w = REPORT_CARD_HEADLINE_WEIGHTS;
  return (
    <div className={compact ? "text-xs" : "text-sm"}>
      <div
        className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${compact ? "gap-1.5" : "gap-3"}`}
      >
        <div className="rounded-lg border border-[var(--border)] bg-[var(--section-light)]/50 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Index A — Legislative
          </p>
          <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-[var(--foreground)]">
            {fmt(indexA)}
          </p>
          <p className="text-[10px] text-[var(--muted-foreground)]">0–100</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--section-light)]/50 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Index B — Constituency
          </p>
          <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-[var(--foreground)]">
            {fmt(indexB)}
          </p>
          <p className="text-[10px] text-[var(--muted-foreground)]">0–100 (normalised)</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--section-light)]/50 px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Index C — Citizen exp.
          </p>
          <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-[var(--foreground)]">
            {fmt(indexC)}
          </p>
          <p className="text-[10px] text-[var(--muted-foreground)]">0–100 (normalised)</p>
        </div>
        <div className="rounded-lg border border-[var(--primary)]/25 bg-[var(--primary)]/[0.06] px-2.5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">Headline</p>
          <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-[var(--foreground)]">
            {fmt(headline)}
          </p>
          <p className="text-[10px] text-[var(--muted-foreground)]">0–100</p>
        </div>
      </div>
      <p className={`mt-2 text-[var(--muted-foreground)] ${compact ? "text-[10px] leading-snug" : "text-xs leading-relaxed"}`}>
        Headline blend: {w.a}·A + {w.b}·B + {w.c}·C ({headlineFormulaNote}).{" "}
        <Link href="/methodology" className={primaryNavLinkClass}>
          Full methodology
        </Link>
      </p>
    </div>
  );
}
