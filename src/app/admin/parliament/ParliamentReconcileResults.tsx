"use client";

import { focusRingSmClass } from "@/lib/primary-link-styles";
import type {
  ParliamentMemberReconcileDbRow,
  ParliamentReconcileCreate,
  ParliamentReconcileUpdate,
} from "@/lib/parliament-reconcile";

const PREVIEW_LIMIT = 40;

function fieldLabel(f: string): string {
  switch (f) {
    case "constituency_slug":
      return "Constituency";
    case "active":
      return "Active";
    default:
      return f.charAt(0).toUpperCase() + f.slice(1);
  }
}

type Props = {
  summary?: {
    csvRowsTotal: number;
    csvRowsValid: number;
    wouldCreate: number;
    wouldUpdate: number;
    unchanged: number;
    inDatabaseNotInCsv: number;
  };
  rowErrors?: string[];
  wouldCreate?: ParliamentReconcileCreate[];
  wouldUpdate?: ParliamentReconcileUpdate[];
  unchangedSlugs?: string[];
  inDatabaseNotInCsv?: ParliamentMemberReconcileDbRow[];
};

export function ParliamentReconcileResults({
  summary,
  rowErrors,
  wouldCreate = [],
  wouldUpdate = [],
  unchangedSlugs = [],
  inDatabaseNotInCsv = [],
}: Props) {
  return (
    <div className="mt-4 space-y-6 text-sm">
      {summary ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/50 px-4 py-3">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">CSV rows</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{summary.csvRowsTotal}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{summary.csvRowsValid} valid for comparison</p>
          </li>
          <li className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/50 px-4 py-3">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Would create / update</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
              {summary.wouldCreate} / {summary.wouldUpdate}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">{summary.unchanged} unchanged</p>
          </li>
          <li className="rounded-xl border border-[var(--border)] bg-amber-50 px-4 py-3 sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-medium text-amber-900/80">In database, not in CSV</p>
            <p className="mt-1 text-lg font-semibold text-amber-950">{summary.inDatabaseNotInCsv}</p>
            <p className="text-xs text-amber-900/70">Review for retired or renamed MPs</p>
          </li>
        </ul>
      ) : null}

      {rowErrors && rowErrors.length > 0 ? (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-red-800">Row issues</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-900/90">
            {rowErrors.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {wouldCreate.length > 0 ? (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
            Would create ({wouldCreate.length}
            {wouldCreate.length > PREVIEW_LIMIT ? ` — showing first ${PREVIEW_LIMIT}` : ""})
          </h3>
          <div className="mt-2 overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full min-w-[32rem] text-left text-xs">
              <thead className="bg-[var(--section-light)] text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Slug</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Party</th>
                  <th className="px-3 py-2 font-medium">Constituency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-white">
                {wouldCreate.slice(0, PREVIEW_LIMIT).map((r) => (
                  <tr key={r.slug}>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px]">{r.slug}</td>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">{r.party ?? "—"}</td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">{r.constituencySlug ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {wouldUpdate.length > 0 ? (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
            Would update ({wouldUpdate.length}
            {wouldUpdate.length > PREVIEW_LIMIT ? ` — showing first ${PREVIEW_LIMIT}` : ""})
          </h3>
          <ul className="mt-2 space-y-2">
            {wouldUpdate.slice(0, PREVIEW_LIMIT).map((u) => (
              <li key={u.slug} className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
                <p className="font-mono text-[11px] font-semibold text-[var(--primary)]">{u.slug}</p>
                <ul className="mt-2 space-y-1 text-xs text-[var(--muted-foreground)]">
                  {u.changes.map((c, i) => (
                    <li key={i}>
                      <span className="font-medium text-[var(--foreground)]">{fieldLabel(c.field)}:</span>{" "}
                      <span className="line-through opacity-70">{c.from}</span>
                      <span className="mx-1 text-[var(--muted-foreground)]">→</span>
                      <span>{c.to}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {unchangedSlugs.length > 0 ? (
        <details className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/30 px-4 py-3">
          <summary
            className={`cursor-pointer rounded-sm text-xs font-medium text-[var(--primary)] ${focusRingSmClass}`}
          >
            Unchanged in CSV ({unchangedSlugs.length} slugs)
          </summary>
          <p className="mt-2 max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed text-[var(--muted-foreground)]">
            {unchangedSlugs.slice(0, 200).join(", ")}
            {unchangedSlugs.length > 200 ? " …" : ""}
          </p>
        </details>
      ) : null}

      {inDatabaseNotInCsv.length > 0 ? (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
            In database, not in file ({inDatabaseNotInCsv.length}
            {inDatabaseNotInCsv.length > PREVIEW_LIMIT ? ` — showing first ${PREVIEW_LIMIT}` : ""})
          </h3>
          <div className="mt-2 overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full min-w-[28rem] text-left text-xs">
              <thead className="bg-[var(--section-light)] text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Slug</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Party</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-white">
                {inDatabaseNotInCsv.slice(0, PREVIEW_LIMIT).map((r) => (
                  <tr key={r.slug}>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px]">{r.slug}</td>
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">{r.party ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
