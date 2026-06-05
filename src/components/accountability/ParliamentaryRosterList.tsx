"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

export type ParliamentaryRosterRow = {
  slug: string;
  name: string;
  role: string;
  party: string | null;
  constituencyName: string | null;
  promiseCount: number;
  mpVoiceReportCount: number;
};

type Props = {
  rows: ParliamentaryRosterRow[];
  showPromises: boolean;
};

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
      <div className="mt-6" role="search">
        <label htmlFor="mp-roster-search" className="block text-sm font-medium text-[var(--foreground)]">
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
          className={`mt-1.5 w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] shadow-sm transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`}
        />
        {normalized ? (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]" role="status" aria-live="polite">
            {filtered.length} of {rows.length} MP{rows.length === 1 ? "" : "s"}{" "}
            {filtered.length === 1 ? "matches" : "match"} your search
          </p>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]" role="status">
          {accountabilityProse.mpRosterSearchEmpty.replace("{query}", trimmed)}
        </p>
      ) : (
        <ul className="mt-4 max-h-[min(28rem,55vh)] divide-y divide-[var(--border)] overflow-y-auto rounded-xl border border-[var(--border)]">
          {filtered.map((m) => (
            <li
              key={m.slug}
              className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5 text-sm hover:bg-[var(--section-light)]/50"
            >
              <div className="min-w-0">
                {showPromises ? (
                  <Link href={`/promises/${encodeURIComponent(m.slug)}`} className={primaryLinkClass}>
                    {m.name}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--foreground)]">{m.name}</span>
                )}
                <span className="text-[var(--muted-foreground)]">
                  {" "}
                  · {m.role}
                  {m.party ? ` · ${m.party}` : ""}
                  {m.constituencyName ? ` · ${m.constituencyName}` : ""}
                </span>
              </div>
              <span className="shrink-0 text-right text-xs text-[var(--muted-foreground)]">
                <span className="tabular-nums">
                  {m.mpVoiceReportCount}{" "}
                  {m.mpVoiceReportCount === 1
                    ? accountabilityProse.mpRosterVoiceReportsSingular
                    : accountabilityProse.mpRosterVoiceReportsPlural}
                </span>
                <span className="text-[var(--muted-foreground)]"> · </span>
                <span className="tabular-nums">
                  {m.promiseCount}{" "}
                  {m.promiseCount === 1
                    ? accountabilityProse.mpRosterListCountLabelSingular
                    : accountabilityProse.mpRosterListCountLabelPlural}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
