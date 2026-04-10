"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { PromiseEvidenceCard } from "@/components/accountability/PromiseEvidenceCard";
import {
  POLICY_SECTOR_LABELS,
  POLICY_SECTOR_VALUES,
} from "@/lib/promise-policy-sectors";
import {
  PROMISE_LIST_STATUS_FILTER,
  PROMISE_LIST_STATUS_LABELS,
} from "@/lib/promise-list-filters";

/** Mirrors GET /api/promises row shape (JSON). */
export type PublicPromiseApiRow = {
  id: string;
  title: string;
  description: string | null;
  sourceLabel: string;
  sourceUrl: string | null;
  sourceDate: string | null;
  verificationNotes: string | null;
  status: string;
  updatedAt: string;
  electionCycle: string | null;
  partySlug: string | null;
  isGovernmentProgramme: boolean;
  policySector: string | null;
  manifesto: {
    id: string;
    title: string;
    partySlug: string | null;
    electionCycle: string | null;
    sourceUrl: string | null;
  } | null;
  member: { name: string; slug: string; role: string; party: string | null } | null;
};

type Props = {
  mode: "browse" | "government";
  initialRows: PublicPromiseApiRow[];
  initialQ: string;
  initialSector: string | undefined;
  initialStatus: string | undefined;
  initialGovernmentOnly: boolean;
  /** Base path for CSV export query mirroring filters */
  csvExportHref: string;
};

const DEBOUNCE_MS = 380;

export function PromisesBrowseLive({
  mode,
  initialRows,
  initialQ,
  initialSector,
  initialStatus,
  initialGovernmentOnly,
  csvExportHref,
}: Props) {
  const [rows, setRows] = useState<PublicPromiseApiRow[]>(initialRows);
  const [q, setQ] = useState(initialQ);
  const [sector, setSector] = useState(initialSector ?? "");
  const [status, setStatus] = useState(initialStatus ?? "");
  const [governmentOnly, setGovernmentOnly] = useState(
    mode === "government" ? true : initialGovernmentOnly,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const govLocked = mode === "government";

  const buildParams = useCallback(() => {
    const p = new URLSearchParams();
    const qt = q.trim();
    if (qt) p.set("q", qt);
    if (sector) p.set("policySector", sector);
    if (status) p.set("status", status);
    if (govLocked || governmentOnly) p.set("governmentOnly", "true");
    return p;
  }, [q, sector, status, governmentOnly, govLocked]);

  const runFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/promises?${buildParams().toString()}`, { cache: "no-store" });
      if (!res.ok) {
        setError(res.status === 429 ? "Too many requests — try again shortly." : "Could not load results.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { promises?: PublicPromiseApiRow[] };
      setRows(Array.isArray(data.promises) ? data.promises : []);
    } catch {
      setError("Network error while searching.");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  const scheduleFetch = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      void runFetch();
    }, DEBOUNCE_MS);
  }, [runFetch]);

  const skipNextDebouncedFetch = useRef(true);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (skipNextDebouncedFetch.current) {
      skipNextDebouncedFetch.current = false;
      return;
    }
    scheduleFetch();
  }, [q, sector, status, governmentOnly, scheduleFetch]);

  const csvHref = useMemo(() => {
    const p = buildParams();
    return `${csvExportHref}?${p.toString()}`;
  }, [buildParams, csvExportHref]);

  const hasActiveFilters = Boolean(
    q.trim() || sector || status || (!govLocked && governmentOnly),
  );

  const clearHref = mode === "government" ? "/government-commitments" : "/promises/browse";

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <label htmlFor="live-q" className="block text-xs font-medium text-[var(--foreground)]">
            Search <span className="font-normal text-[var(--muted-foreground)]">(live)</span>
          </label>
          <input
            id="live-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title or description…"
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            autoComplete="off"
          />
        </div>
        <div className="sm:w-44">
          <label htmlFor="live-sector" className="block text-xs font-medium text-[var(--foreground)]">
            Category
          </label>
          <select
            id="live-sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {POLICY_SECTOR_VALUES.map((v) => (
              <option key={v} value={v}>
                {POLICY_SECTOR_LABELS[v]}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:w-40">
          <label htmlFor="live-status" className="block text-xs font-medium text-[var(--foreground)]">
            Status
          </label>
          <select
            id="live-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {PROMISE_LIST_STATUS_FILTER.map((v) => (
              <option key={v} value={v}>
                {PROMISE_LIST_STATUS_LABELS[v]}
              </option>
            ))}
          </select>
        </div>
        {!govLocked ? (
          <div className="flex items-center gap-2 pb-2 sm:pb-0">
            <input
              id="live-gov"
              type="checkbox"
              checked={governmentOnly}
              onChange={(e) => setGovernmentOnly(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            <label htmlFor="live-gov" className="text-sm text-[var(--foreground)]">
              Government programme only
            </label>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          {loading ? (
            <span className="text-xs text-[var(--muted-foreground)]">Updating…</span>
          ) : (
            <span className="text-xs text-[var(--muted-foreground)]">Results update as you type</span>
          )}
          {hasActiveFilters ? (
            <Link
              href={clearHref}
              className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--section-light)]"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>
      ) : null}

      {rows.length === 0 && !loading ? (
        <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
          {mode === "government"
            ? "No government-programme commitments match. Try clearing search or filters."
            : "No promise records match. Try clearing search or filters."}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <>
          <p className="mt-6 text-xs text-[var(--muted-foreground)]">
            Showing {rows.length} result{rows.length === 1 ? "" : "s"}
            {rows.length >= 75 ? " (max 75 per request — refine search)" : ""}. Full export:{" "}
            <Link href={csvHref} className="text-[var(--primary)] hover:underline">
              CSV export
            </Link>
            .
          </p>
          <ul className="mt-4 space-y-6">
            {rows.map((p) => (
              <li key={p.id}>
                <PromiseEvidenceCard
                  title={p.title}
                  description={p.description}
                  status={p.status}
                  sourceLabel={p.sourceLabel}
                  sourceDate={p.sourceDate ? new Date(p.sourceDate) : null}
                  sourceUrl={p.sourceUrl}
                  verificationNotes={p.verificationNotes}
                  manifestoDocument={
                    p.manifesto ? { title: p.manifesto.title, sourceUrl: p.manifesto.sourceUrl } : null
                  }
                  policySector={p.policySector}
                  meta={
                    p.member ? (
                      <>
                        <Link
                          href={`/promises/${encodeURIComponent(p.member.slug)}`}
                          className="font-medium text-[var(--primary)] hover:underline"
                        >
                          {p.member.name}
                        </Link>
                        <span>
                          {" "}
                          · {p.member.role}
                          {p.member.party ? ` · ${p.member.party}` : ""}
                        </span>
                        {p.isGovernmentProgramme ? (
                          <span className="ml-1 rounded-full bg-[var(--section-light)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--foreground)]">
                            Gov programme
                          </span>
                        ) : null}
                        {p.electionCycle ? (
                          <span className="text-[var(--muted-foreground)]"> · Cycle {p.electionCycle}</span>
                        ) : null}
                      </>
                    ) : null
                  }
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}
