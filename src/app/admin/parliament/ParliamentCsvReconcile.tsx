"use client";

import { useState } from "react";

type ReconcileResponse = {
  ok?: boolean;
  error?: string;
  summary?: {
    csvRowsTotal: number;
    csvRowsValid: number;
    wouldCreate: number;
    wouldUpdate: number;
    unchanged: number;
    inDatabaseNotInCsv: number;
  };
  rowErrors?: string[];
  wouldCreate?: unknown[];
  wouldUpdate?: unknown[];
  unchangedSlugs?: string[];
  inDatabaseNotInCsv?: unknown[];
};

export function ParliamentCsvReconcile() {
  const [message, setMessage] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setRawJson(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/admin/parliament-members/reconcile", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as ReconcileResponse;
      if (!res.ok) {
        setMessage(data.error ?? "Reconcile failed.");
        return;
      }
      const s = data.summary;
      if (s) {
        setMessage(
          [
            `CSV rows: ${s.csvRowsTotal} (${s.csvRowsValid} valid for diff).`,
            `Would create: ${s.wouldCreate}; would update: ${s.wouldUpdate}; unchanged: ${s.unchanged}.`,
            `In DB but not in CSV: ${s.inDatabaseNotInCsv} (review for retired MPs or file scope).`,
            (data.rowErrors?.length ?? 0) > 0
              ? `Row errors: ${data.rowErrors!.length} (see details below).`
              : "",
          ]
            .filter(Boolean)
            .join(" "),
        );
      } else {
        setMessage("OK");
      }
      setRawJson(JSON.stringify(data, null, 2));
    } catch {
      setMessage("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">Dry-run reconcile (CSV)</h2>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        Same format as MP import. Compares the file to the current database{" "}
        <strong>without writing</strong>. Use before import to spot unknown constituencies, renames, and DB rows missing
        from your file.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="reconcile-csv" className="sr-only">
            CSV file for reconcile
          </label>
          <input
            id="reconcile-csv"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            disabled={loading}
            className="block w-full text-sm text-[var(--foreground)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--primary)]/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-[var(--primary)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/5 px-5 py-2.5 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10 disabled:opacity-60"
        >
          {loading ? "Comparing…" : "Run dry-run"}
        </button>
      </form>
      {message ? (
        <p className="mt-3 text-sm text-[var(--muted-foreground)] whitespace-pre-wrap" role="status">
          {message}
        </p>
      ) : null}
      {rawJson ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-medium text-[var(--primary)]">Full JSON response</summary>
          <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-[var(--section-dark)] p-3 text-[11px] text-white/90">
            {rawJson}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
