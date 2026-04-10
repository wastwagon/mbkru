"use client";

import { useState } from "react";

import { ParliamentReconcileResults } from "./ParliamentReconcileResults";
import type { ParliamentReconcileResult } from "@/lib/parliament-reconcile";

type ReconcileResponse = { ok?: boolean; error?: string } & Partial<ParliamentReconcileResult>;

export function ParliamentCsvReconcile() {
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ParliamentReconcileResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setResult(null);
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
      if (data.summary && Array.isArray(data.rowErrors) && Array.isArray(data.wouldCreate) && Array.isArray(data.wouldUpdate)) {
        setResult({
          summary: data.summary,
          rowErrors: data.rowErrors,
          wouldCreate: data.wouldCreate,
          wouldUpdate: data.wouldUpdate,
          unchangedSlugs: data.unchangedSlugs ?? [],
          inDatabaseNotInCsv: data.inDatabaseNotInCsv ?? [],
        });
        setMessage("Dry-run complete — review the summary below.");
      } else {
        setMessage("OK — unexpected response shape.");
      }
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
      {result ? <ParliamentReconcileResults {...result} /> : null}
    </div>
  );
}
