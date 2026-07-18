"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { MpPortrait } from "@/components/accountability/MpPortrait";
import { focusRingSmClass } from "@/lib/primary-link-styles";

export type ParliamentaryRosterRow = {
  slug: string;
  name: string;
  role: string;
  party: string | null;
  constituencyName: string | null;
  promiseCount: number;
  mpVoiceReportCount: number;
  portraitPath?: string | null;
};

type Props = {
  rows: ParliamentaryRosterRow[];
  showPromises: boolean;
};

const filterLabelClass = "mb-1.5 block text-xs font-semibold text-[var(--foreground-secondary)] sm:text-sm";

function rowSearchText(row: ParliamentaryRosterRow): string {
  return [row.name, row.role, row.party, row.constituencyName].filter(Boolean).join(" ").toLowerCase();
}

function matchesSearch(row: ParliamentaryRosterRow, query: string): boolean {
  const haystack = rowSearchText(row);
  const tokens = query.split(/\s+/).filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

export function ParliamentaryRosterList({ rows, showPromises }: Props) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const normalized = trimmed.toLowerCase();

  const filtered = useMemo(
    () => (normalized ? rows.filter((row) => matchesSearch(row, normalized)) : rows),
    [rows, normalized],
  );

  return (
    <>
      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5" role="search">
        <label htmlFor="mp-roster-search" className={filterLabelClass}>
          {accountabilityProse.mpRosterSearchLabel}
        </label>
        <input
          id="mp-roster-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={accountabilityProse.mpRosterSearchPlaceholder}
          autoComplete="off"
          enterKeyHint="search"
          className={`w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`}
        />
        {normalized ? (
          <p className="mt-2 text-xs text-[var(--foreground-secondary)]" role="status" aria-live="polite">
            {filtered.length} of {rows.length} MP{rows.length === 1 ? "" : "s"}{" "}
            {filtered.length === 1 ? "matches" : "match"} your search
          </p>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--foreground-secondary)]" role="status">
          {accountabilityProse.mpRosterSearchEmpty.replace("{query}", trimmed)}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {filtered.map((m) => {
            const sheetHref = `/promises/${encodeURIComponent(m.slug)}`;
            const metaParts = [m.role, m.party, m.constituencyName].filter(Boolean);

            return (
              <li key={m.slug}>
                <article className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/35 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <MpPortrait name={m.name} portraitPath={m.portraitPath} size="md" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-[var(--foreground)]">
                          {showPromises ? (
                            <Link href={sheetHref} className="hover:text-[var(--primary)]" prefetch={false}>
                              {m.name}
                            </Link>
                          ) : (
                            m.name
                          )}
                        </h3>
                        {metaParts.length > 0 ? (
                          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{metaParts.join(" · ")}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-[var(--foreground-secondary)]">
                      <p className="tabular-nums">
                        <span className="font-semibold text-[var(--foreground)]">{m.mpVoiceReportCount}</span>{" "}
                        {m.mpVoiceReportCount === 1
                          ? accountabilityProse.mpRosterVoiceReportsSingular
                          : accountabilityProse.mpRosterVoiceReportsPlural}
                      </p>
                      <p className="mt-0.5 tabular-nums">
                        <span className="font-semibold text-[var(--accent-gold)]">{m.promiseCount}</span>{" "}
                        {m.promiseCount === 1
                          ? accountabilityProse.mpRosterListCountLabelSingular
                          : accountabilityProse.mpRosterListCountLabelPlural}
                      </p>
                    </div>
                  </div>
                  {showPromises ? (
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <Link
                        href={sheetHref}
                        className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`}
                        prefetch={false}
                      >
                        Open commitment sheet
                      </Link>
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
