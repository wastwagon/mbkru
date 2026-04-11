"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import type { PromiseTrackerStats } from "@/lib/promise-tracker-public-types";

type Props = {
  stats: PromiseTrackerStats;
  /** Shown under the headline metrics */
  subtitle?: string;
  /** Tighter spacing and hide partner-data footer (e.g. homepage embed). */
  compact?: boolean;
};

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function KpiCard({
  label,
  children,
  accent,
}: {
  label: string;
  children: ReactNode;
  accent?: "default" | "emerald";
}) {
  const ring =
    accent === "emerald"
      ? "ring-1 ring-emerald-200/80 shadow-emerald-500/10"
      : "ring-1 ring-slate-200/90 shadow-slate-900/5";
  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-md ${ring} sm:p-5`}
      style={{ boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)" }}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <div className="mt-2 text-slate-900">{children}</div>
    </div>
  );
}

export function PromiseTrackerStatsStrip({ stats, subtitle, compact }: Props) {
  const partnerDataPageEnabled = platformFeatures.partnerJsonProgramme(getPublicPlatformPhase());
  const { byStatus, totalPromises } = stats;
  const met = byStatus.FULFILLED ?? 0;
  const inProgress = byStatus.IN_PROGRESS ?? 0;
  const broken = byStatus.BROKEN ?? 0;
  const tracking = (byStatus.TRACKING ?? 0) + (byStatus.DEFERRED ?? 0);
  const barTotal = Math.max(1, met + inProgress + broken + tracking);

  return (
    <div className={`w-full ${compact ? "mt-0 space-y-4" : "mt-8 space-y-5"}`}>
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6 text-white shadow-xl ring-1 ring-slate-700/60 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200/90">Tracker snapshot</p>
            <p className="mt-2 text-base font-medium leading-snug text-slate-100 sm:text-lg">
              {stats.scope === "government"
                ? "Government-programme commitments in the public catalogue."
                : "Live counts from the campaign-promise database (not macro-economic statistics)."}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-400/15 px-3.5 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/30">
            Data live
          </span>
        </div>

        <dl
          className={`mt-6 grid grid-cols-2 gap-3 ${stats.scope === "all" ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}
        >
          <KpiCard label={stats.scope === "government" ? "Gov commitments" : "Promises tracked"}>
            <p className="font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
              {stats.totalPromises}
            </p>
          </KpiCard>
          {stats.scope === "all" ? (
            <KpiCard label="Gov-tagged" accent="emerald">
              <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-emerald-950 sm:text-4xl">
                {stats.governmentPromises}
              </p>
            </KpiCard>
          ) : null}
          <KpiCard label="MPs w/ promises">
            <p className="font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
              {stats.mpsWithPromises}
              <span className="ml-1.5 text-lg font-semibold text-slate-500 sm:text-xl">/ {stats.activeMpsTotal}</span>
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">Active MPs in catalogue</p>
          </KpiCard>
          <KpiCard label="Report card cycles">
            <p className="font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
              {stats.publishedReportCardCycles}
            </p>
          </KpiCard>
          <KpiCard label="Scorecard rows">
            <p className="font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
              {stats.reportCardEntriesPublished}
            </p>
          </KpiCard>
        </dl>
      </div>

      {totalPromises > 0 ? (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-bold text-slate-900">Commitment status mix</p>
            <p className="text-sm font-medium text-slate-500">{totalPromises} in this view</p>
          </div>
          <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
            <span
              className="h-full bg-emerald-500 transition-[width] duration-500"
              style={{ width: `${pct(met, barTotal)}%` }}
              title={`Fulfilled: ${met}`}
            />
            <span
              className="h-full bg-sky-500 transition-[width] duration-500"
              style={{ width: `${pct(inProgress, barTotal)}%` }}
              title={`In progress: ${inProgress}`}
            />
            <span
              className="h-full bg-rose-500 transition-[width] duration-500"
              style={{ width: `${pct(broken, barTotal)}%` }}
              title={`Broken: ${broken}`}
            />
            <span
              className="h-full bg-slate-300 transition-[width] duration-500"
              style={{ width: `${pct(tracking, barTotal)}%` }}
              title={`Tracking / deferred: ${tracking}`}
            />
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-700">
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              Fulfilled <span className="tabular-nums text-slate-900">{met}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              In progress <span className="tabular-nums text-slate-900">{inProgress}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" aria-hidden />
              Broken <span className="tabular-nums text-slate-900">{broken}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300" aria-hidden />
              Tracking / deferred <span className="tabular-nums text-slate-900">{tracking}</span>
            </li>
          </ul>
        </div>
      ) : null}

      {subtitle ? (
        <p className="text-center text-sm leading-relaxed text-slate-600">{subtitle}</p>
      ) : null}

      {!compact ? (
        <p className="text-center text-sm leading-relaxed text-slate-600">
          Totals and status mix update as editors publish changes to the catalogue — they are not macro-economic forecasts.
          {partnerDataPageEnabled ? (
            <>
              {" "}
              Media, CSOs, and civic technologists can reuse the same figures under our{" "}
              <Link
                href="/partner-api"
                className="font-medium text-sky-700 underline decoration-sky-700/30 underline-offset-2 hover:text-sky-900"
              >
                partner data &amp; API
              </Link>{" "}
              terms (machine-readable exports; rate limits apply).
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
