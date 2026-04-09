"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConstituencyCsvImport() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/admin/constituencies/import", {
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
        `Constituencies: created ${data.created ?? 0}, updated ${data.updated ?? 0}.`,
        (data.skipped ?? 0) > 0 ? `Skipped ${data.skipped} row(s).` : "",
        ...(data.errors?.length ? data.errors : []),
      ].filter(Boolean);
      setMessage(parts.join(" "));
      form.reset();
      router.refresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <h2 className="text-sm font-semibold text-[var(--foreground)]">Import constituencies (CSV)</h2>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        Load EC-aligned constituency master rows before MP import. Header:{" "}
        <code className="rounded bg-[var(--section-light)] px-1 py-0.5 text-[11px]">
          name,slug,region_slug,code
        </code>
        . <code className="rounded bg-[var(--section-light)] px-1 py-0.5 text-[11px]">region_slug</code> must match
        a seeded region (e.g. <code className="text-[11px]">greater-accra</code>).{" "}
        <code className="rounded bg-[var(--section-light)] px-1 py-0.5 text-[11px]">code</code> may be empty.
        Example: <code className="text-[11px]">prisma/data/constituencies.example.csv</code>.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="constituency-csv" className="sr-only">
            Constituency CSV file
          </label>
          <input
            id="constituency-csv"
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
          className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-60"
        >
          {loading ? "Importing…" : "Upload constituencies"}
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
