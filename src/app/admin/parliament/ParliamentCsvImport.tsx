"use client";

import { useState } from "react";

export function ParliamentCsvImport() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/admin/parliament-members/import", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
        created?: number;
        updated?: number;
        skipped?: number;
        errors?: string[];
      };
      if (!res.ok) {
        setMessage(data.error ?? "Import failed.");
        return;
      }
      const parts = [
        `Created ${data.created ?? 0}, updated ${data.updated ?? 0}.`,
        (data.skipped ?? 0) > 0 ? `Skipped ${data.skipped} row(s).` : "",
        ...(data.errors?.length ? data.errors : []),
      ].filter(Boolean);
      setMessage(parts.join(" "));
      form.reset();
    } catch {
      setMessage("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">Import CSV</h2>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        Header row (exact):{" "}
        <code className="rounded bg-[var(--section-light)] px-1 py-0.5 text-[11px]">
          name,slug,role,party,constituency_slug,active
        </code>
        . Empty party/constituency allowed.{" "}
        <code className="rounded bg-[var(--section-light)] px-1 py-0.5 text-[11px]">active</code>{" "}
        true/false. Constituency must match an existing slug in the database.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="parliament-csv" className="sr-only">
            CSV file
          </label>
          <input
            id="parliament-csv"
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
          className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60"
        >
          {loading ? "Importing…" : "Upload"}
        </button>
      </form>
      {message ? (
        <p className="mt-3 text-sm text-[var(--muted-foreground)] whitespace-pre-wrap" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
