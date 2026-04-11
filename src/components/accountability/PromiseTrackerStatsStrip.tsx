"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import type { PromiseTrackerStats } from "@/lib/promise-tracker-public-types";

type Props = {
  stats: PromiseTrackerStats;
  /** Shown under the headline metrics */
  subtitle?: string;
  /** Tighter spacing; status breakdown is merged into the snapshot card to avoid duplicate panels. */
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

function StatusBreakdownBlock({
  met,
  inProgress,
  broken,
  tracking,
  variant,
}: {
  met: number;
  inProgress: number;
  broken: number;
  tracking: number;
  variant: "light" | "dark";
}) {
  const barTotal = Math.max(1, met + inProgress + broken + tracking);
  const titleClass =
    variant === "dark"
      ? "text-[11px] font-bold uppercase tracking-[0.12em] text-sky-200/90"
      : "text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500";
  const legendClass = variant === "dark" ? "text-sm font-medium text-slate-200" : "text-sm font-medium text-slate-700";
  const numClass = variant === "dark" ? "tabular-nums text-white" : "tabular-nums text-slate-900";
  const trackBg = variant === "dark" ? "bg-slate-700/80 ring-slate-600/60" : "bg-slate-100 ring-slate-200/80";

  return (
    <div className={variant === "dark" ? "mt-6 border-t border-white/10 pt-6" : ""}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className={variant === "light" ? "text-base font-bold text-slate-900" : titleClass}>Status breakdown</p>
        {variant === "light" ? (
          <p className="max-w-sm text-right text-xs leading-snug text-slate-500">
            Workflow tags — counts sum to the headline total above.
          </p>
        ) : null}
      </div>
      {variant === "light" ? (
        <p className="mt-1 text-xs text-slate-500">Fulfilled, in progress, broken, and tracking / deferred.</p>
      ) : (
        <p className="mt-2 text-xs leading-snug text-slate-300/90">
          How those rows are classified (same slice as the headline total).
        </p>
      )}
      <div className={`mt-4 flex h-4 w-full overflow-hidden rounded-full ring-1 ${trackBg}`}>
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
          className="h-full bg-slate-400 transition-[width] duration-500"
          style={{ width: `${pct(tracking, barTotal)}%` }}
          title={`Tracking / deferred: ${tracking}`}
        />
      </div>
      <ul className={`mt-4 flex flex-wrap gap-x-6 gap-y-2 ${legendClass}`}>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
          Fulfilled <span className={numClass}>{met}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
          In progress <span className={numClass}>{inProgress}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" aria-hidden />
          Broken <span className={numClass}>{broken}</span>
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
          Tracking / deferred <span className={numClass}>{tracking}</span>
        </li>
      </ul>
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

  const headlineLabel =
    stats.scope === "government"
      ? totalPromises === 1
        ? "government-programme row in this slice"
        : "government-programme rows in this slice"
      : totalPromises === 1
        ? "promise in this catalogue slice"
        : "promises in this catalogue slice";

  const snapshotIntro =
    stats.scope === "government"
      ? "Programme reach and accountability signals — headline count is separate from workflow breakdown below."
      : "Catalogue reach and accountability signals — headline count is separate from workflow breakdown below.";

  return (
    <div className={`w-full ${compact ? "mt-0 space-y-4" : "mt-8 space-y-5"}`}>
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6 text-white shadow-xl ring-1 ring-slate-700/60 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200/90">Tracker snapshot</p>
            <p className="mt-2 text-base font-medium leading-snug text-slate-100 sm:text-lg">{snapshotIntro}</p>
            <p className="mt-4 text-slate-100">
              <span className="font-display text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
                {totalPromises}
              </span>
              <span className="mt-2 block text-base font-semibold leading-snug text-slate-300 sm:mt-0 sm:ml-3 sm:inline sm:text-lg">
                {headlineLabel}
              </span>
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-400/15 px-3.5 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/30">
            Data live
          </span>
        </div>

        <dl
          className={`mt-6 grid grid-cols-2 gap-3 ${stats.scope === "all" ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
        >
          {stats.scope === "all" ? (
            <KpiCard label="Gov-tagged" accent="emerald">
              <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-emerald-950 sm:text-4xl">
                {stats.governmentPromises}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">Also on Government commitments</p>
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

        {totalPromises > 0 && compact ? (
          <StatusBreakdownBlock
            met={met}
            inProgress={inProgress}
            broken={broken}
            tracking={tracking}
            variant="dark"
          />
        ) : null}
      </div>

      {totalPromises > 0 && !compact ? (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <StatusBreakdownBlock
            met={met}
            inProgress={inProgress}
            broken={broken}
            tracking={tracking}
            variant="light"
          />
        </div>
      ) : null}

      {subtitle ? (
        <p className="text-center text-sm leading-relaxed text-slate-600">{subtitle}</p>
      ) : null}

      {!compact ? (
        <p className="text-center text-sm leading-relaxed text-slate-600">
          Figures refresh when editors publish catalogue changes (and when admin actions invalidate the public cache).
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
