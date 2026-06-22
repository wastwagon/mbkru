"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

export type RepresentativeSearchRow = {
  slug: string;
  name: string;
  party: string | null;
  constituencyName: string | null;
  promiseCount: number;
};

type Props = {
  rows: RepresentativeSearchRow[];
  showPromises?: boolean;
  /** Compact card for homepage embed */
  variant?: "default" | "prominent";
  className?: string;
};

function rowSearchText(row: RepresentativeSearchRow): string {
  return [row.name, row.party, row.constituencyName].filter(Boolean).join(" ").toLowerCase();
}

function matchesSearch(row: RepresentativeSearchRow, query: string): boolean {
  const tokens = query.split(/\s+/).filter(Boolean);
  return tokens.every((token) => rowSearchText(row).includes(token));
}

export function FindYourRepresentative({
  rows,
  showPromises = true,
  variant = "default",
  className = "",
}: Props) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const normalized = trimmed.toLowerCase();

  const results = useMemo(() => {
    if (!normalized) return [];
    return rows.filter((row) => matchesSearch(row, normalized)).slice(0, 8);
  }, [rows, normalized]);

  if (rows.length === 0) return null;

  const prominent = variant === "prominent";

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-[var(--primary)]/20 bg-gradient-to-br from-white via-white to-[var(--primary)]/[0.04] shadow-[var(--shadow-card)] ${className}`}
      aria-labelledby="find-rep-heading"
    >
      <div className={`${prominent ? "p-6 sm:p-8" : "p-4 sm:p-5"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Find your representative</p>
            <h2
              id="find-rep-heading"
              className={`mt-1 font-display font-bold text-[var(--foreground)] ${prominent ? "text-xl sm:text-2xl" : "text-lg"}`}
            >
              Search {rows.length} sitting MP{rows.length === 1 ? "" : "s"}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--foreground-secondary)]">
              {prominent
                ? "Journalists, diaspora voters, and citizens — look up by name, party, or constituency. Open a pledge sheet when the catalogue is live."
                : accountabilityProse.mpRosterSearchLabel + " — name, party, or constituency."}
            </p>
          </div>
          {showPromises ? (
            <Link href="/promises" className={`shrink-0 text-sm ${primaryLinkClass}`}>
              Full roster →
            </Link>
          ) : null}
        </div>

        <div className="mt-5" role="search">
          <label htmlFor="find-rep-search" className="sr-only">
            {accountabilityProse.mpRosterSearchPlaceholder}
          </label>
          <div className="relative">
            <span
              className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--foreground-secondary)]/60"
              aria-hidden
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              id="find-rep-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={accountabilityProse.mpRosterSearchPlaceholder}
              autoComplete="off"
              enterKeyHint="search"
              className={`w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white py-3 pl-12 pr-4 text-sm text-[var(--foreground)] shadow-sm transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`}
            />
          </div>
        </div>

        {normalized ? (
          <div className="mt-4" role="status" aria-live="polite">
            {results.length === 0 ? (
              <p className="text-sm text-[var(--foreground-secondary)]">
                {accountabilityProse.mpRosterSearchEmpty.replace("{query}", trimmed)}
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)]/80 overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                {results.map((row) => {
                  const meta = [row.party, row.constituencyName].filter(Boolean).join(" · ");
                  const href = showPromises ? `/promises/${encodeURIComponent(row.slug)}` : "/parliament-tracker";
                  return (
                    <li key={row.slug}>
                      <Link
                        href={href}
                        className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-[var(--section-light)] ${focusRingSmClass}`}
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-[var(--foreground)]">{row.name}</span>
                          {meta ? (
                            <span className="mt-0.5 block truncate text-xs text-[var(--foreground-secondary)]">{meta}</span>
                          ) : null}
                        </div>
                        {showPromises && row.promiseCount > 0 ? (
                          <span className="shrink-0 rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[var(--primary)]">
                            {row.promiseCount} row{row.promiseCount === 1 ? "" : "s"}
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs font-medium text-[var(--primary)]">View →</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {results.length >= 8 ? (
              <p className="mt-2 text-center text-xs text-[var(--foreground-secondary)]">
                Showing first 8 matches — refine your search or{" "}
                <Link href="/parliament-tracker" className={primaryLinkClass}>
                  browse the full roster
                </Link>
                .
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-xs text-[var(--foreground-secondary)]">
            Tip: try a constituency name (e.g. &quot;Tamale South&quot;) or party abbreviation.
          </p>
        )}
      </div>
    </section>
  );
}
