"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
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

function conicStops(
  met: number,
  inProgress: number,
  broken: number,
  tracking: number,
): string {
  const t = met + inProgress + broken + tracking;
  if (t <= 0) return "transparent 0% 100%";
  const s1 = (met / t) * 100;
  const s2 = s1 + (inProgress / t) * 100;
  const s3 = s2 + (broken / t) * 100;
  return [
    `rgb(16 185 129) 0% ${s1}%`,
    `rgb(14 165 233) ${s1}% ${s2}%`,
    `rgb(244 63 94) ${s2}% ${s3}%`,
    `rgb(148 163 184) ${s3}% 100%`,
  ].join(", ");
}

function KpiCard({
  label,
  children,
  foot,
  accent,
}: {
  label: string;
  children: ReactNode;
  foot?: string;
  accent?: "default" | "emerald" | "amber";
}) {
  const ring =
    accent === "emerald"
      ? "ring-1 ring-emerald-200/80 shadow-emerald-500/10"
      : accent === "amber"
        ? "ring-1 ring-amber-200/80 shadow-amber-500/10"
        : "ring-1 ring-slate-200/90 shadow-slate-900/5";
  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-md ${ring} sm:p-5`}
      style={{ boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)" }}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <div className="mt-2 text-slate-900">{children}</div>
      {foot ? <p className="mt-1.5 text-[10px] font-medium leading-snug text-slate-500">{foot}</p> : null}
    </div>
  );
}

function StatusDonutWithLegend({
  met,
  inProgress,
  broken,
  tracking,
  fulfilledPct,
  variant,
}: {
  met: number;
  inProgress: number;
  broken: number;
  tracking: number;
  fulfilledPct: number;
  variant: "light" | "dark";
}) {
  const t = met + inProgress + broken + tracking;
  const pieStyle: CSSProperties =
    t > 0
      ? { background: `conic-gradient(${conicStops(met, inProgress, broken, tracking)})` }
      : { background: "repeating-conic-gradient(rgb(148 163 184 / 0.35) 0% 25%, transparent 25% 50%)" };
  const holeClass =
    variant === "dark"
      ? "bg-gradient-to-br from-slate-900 to-slate-800 ring-1 ring-slate-600/50"
      : "bg-white ring-1 ring-slate-200/90";
  const labelBright = variant === "dark" ? "text-sky-200/90" : "text-slate-500";
  const legendClass = variant === "dark" ? "text-sm font-medium text-slate-200" : "text-sm font-medium text-slate-700";
  const numClass = variant === "dark" ? "tabular-nums text-white" : "tabular-nums text-slate-900";
  const centerMuted = variant === "dark" ? "text-slate-400" : "text-slate-500";
  const centerNum = variant === "dark" ? "text-white" : "text-slate-900";

  return (
    <div
      className={
        variant === "dark" ? "mt-6 border-t border-white/10 pt-6" : "mt-0 border-t-0 pt-0 sm:mt-0 sm:border-t-0 sm:pt-0"
      }
    >
      <div className="flex flex-wrap items-start gap-6 sm:gap-10">
        <div className="flex shrink-0 flex-col items-center">
          <p
            className={
              variant === "dark"
                ? "text-[11px] font-bold uppercase tracking-[0.12em] text-sky-200/90"
                : "text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
            }
          >
            Status mix
          </p>
          <p className={`mt-1 text-center text-xs ${centerMuted}`}>Fulfilled share of this slice</p>
          <div className="relative mt-3 h-36 w-36 sm:h-40 sm:w-40">
            <div className="absolute inset-0 rounded-full shadow-inner ring-1 ring-black/5" style={pieStyle} />
            <div
              className={`absolute inset-[20%] flex flex-col items-center justify-center rounded-full ${holeClass} shadow-inner`}
            >
              <span className={`font-display text-2xl font-bold tabular-nums sm:text-3xl ${centerNum}`}>
                {t > 0 ? `${fulfilledPct}%` : "—"}
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-wider ${centerMuted}`}>Fulfilled</span>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className={variant === "light" ? "text-base font-bold text-slate-900" : labelBright}>Status breakdown</p>
            {variant === "light" ? (
              <p className="max-w-sm text-right text-xs leading-snug text-slate-500">
                Same filter slice as the headline total; segments sum to {t}.
              </p>
            ) : null}
          </div>
          {variant === "light" ? (
            <p className="mt-1 text-xs text-slate-500">Fulfilled, in progress, broken, and tracking / deferred.</p>
          ) : (
            <p className="mt-2 text-xs leading-snug text-slate-300/90">
              How rows are classified in this view — all five workflow states are included in the total.
            </p>
          )}
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
      </div>
    </div>
  );
}

function PolicyMixStrip({
  rows,
  totalInSlice,
  variant,
}: {
  rows: { key: string; label: string; count: number }[];
  totalInSlice: number;
  variant: "light" | "dark";
}) {
  if (rows.length === 0) return null;
  const max = Math.max(1, rows[0]?.count ?? 1);
  const barBg = variant === "dark" ? "bg-slate-700/80" : "bg-slate-200/90";
  const barFill = variant === "dark" ? "bg-sky-300/80" : "bg-sky-600/80";
  const textMuted = variant === "dark" ? "text-slate-400" : "text-slate-500";
  const textMain = variant === "dark" ? "text-slate-100" : "text-slate-800";
  return (
    <div
      className={
        variant === "dark"
          ? "mt-6 border-t border-white/10 pt-6"
          : "mt-5 border-t border-slate-200/80 pt-5"
      }
    >
      <p
        className={
          variant === "dark"
            ? "text-[11px] font-bold uppercase tracking-[0.12em] text-sky-200/90"
            : "text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
        }
      >
        Policy mix (this slice)
      </p>
      <p className={`mt-1 text-xs ${textMuted}`}>
        How the policy category field is distributed in this slice (uncategorised rows may appear as their own line) ·{" "}
        {totalInSlice} row{totalInSlice === 1 ? "" : "s"} in view.
      </p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <li key={r.key || "uncat"} className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className={`w-[min(100%,8rem)] shrink-0 truncate text-xs font-medium sm:text-sm ${textMain}`}>
              {r.label}
            </span>
            <div className={`h-2 min-w-0 flex-1 overflow-hidden rounded-full ${barBg}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${barFill}`}
                style={{ width: `${(r.count / max) * 100}%` }}
                title={`${r.label}: ${r.count}`}
              />
            </div>
            <span className={`w-8 shrink-0 text-right text-xs font-semibold tabular-nums ${textMain}`}>
              {r.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PromiseTrackerStatsStrip({ stats, subtitle, compact }: Props) {
  const phase = getPublicPlatformPhase();
  const partnerDataPageEnabled = platformFeatures.partnerJsonProgramme(phase);
  const showPrcShortcut = platformFeatures.publicReportCard(phase);
  const { byStatus, totalPromises, topPolicySectors } = stats;
  const met = byStatus.FULFILLED ?? 0;
  const inProgress = byStatus.IN_PROGRESS ?? 0;
  const broken = byStatus.BROKEN ?? 0;
  const tracking = (byStatus.TRACKING ?? 0) + (byStatus.DEFERRED ?? 0);
  const statusSum = met + inProgress + broken + tracking;
  const statusIntegrityOk = totalPromises === 0 || statusSum === totalPromises;
  const fulfilledSlicePct = totalPromises > 0 ? Math.round((met / totalPromises) * 1000) / 10 : 0;
  const mpCoverPct =
    stats.activeMpsTotal > 0
      ? Math.round((stats.mpsWithPromises / stats.activeMpsTotal) * 1000) / 10
      : 0;
  const notProgrammeInSlice = Math.max(0, totalPromises - stats.governmentPromises);

  const headlineLabel =
    stats.scope === "government"
      ? totalPromises === 1
        ? "government-programme row in this slice"
        : "government-programme rows in this slice"
      : totalPromises === 1
        ? "commitment in this catalogue slice"
        : "commitments in this catalogue slice";

  const snapshotIntro =
    stats.scope === "government"
      ? "Programme- and executive-tagged rows in this view — headline total, status mix, and the MP card below use the same filter slice."
      : "Sitting-MP catalogue rows in this view — headline total, status mix, and filters stay aligned to the list.";

  return (
    <div className={`w-full ${compact ? "mt-0 space-y-4" : "mt-8 space-y-5"}`}>
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6 text-white shadow-xl ring-1 ring-slate-700/60 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200/90">{accountabilityProse.statsStripEyebrow}</p>
            <p className="mt-2 text-base font-medium leading-snug text-slate-100 sm:text-lg">{snapshotIntro}</p>
            {showPrcShortcut ? (
              <p className="mt-2 text-xs leading-relaxed text-sky-100/85 sm:text-sm">
                {accountabilityProse.statsStripPrcDisambiguation}{" "}
                <Link href="/report-card" className="font-semibold text-white underline decoration-sky-200/70 underline-offset-2 hover:text-sky-50">
                  People&apos;s Report Card
                </Link>
                .
              </p>
            ) : null}
            <p className="mt-4 text-slate-100">
              <span className="font-display text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
                {totalPromises}
              </span>
              <span className="mt-2 block text-base font-semibold leading-snug text-slate-300 sm:mt-0 sm:ml-3 sm:inline sm:text-lg">
                {headlineLabel}
              </span>
            </p>
            {totalPromises > 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                Outcomes:{" "}
                <span className="font-semibold text-slate-200">{fulfilledSlicePct}%</span> fulfilled ·{" "}
                <span className="font-semibold text-slate-200">{mpCoverPct}%</span> of active MPs with ≥1 row
              </p>
            ) : null}
            {!statusIntegrityOk ? (
              <p className="mt-2 text-xs text-amber-200/90" role="status">
                Status subtotals ({statusSum}) and headline ({totalPromises}) differ — new workflow values may need to be
                added to the public strip.
              </p>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full bg-emerald-400/15 px-3.5 py-1.5 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/30">
            Data live
          </span>
        </div>

        <dl
          className={`mt-6 grid grid-cols-2 gap-3 ${stats.scope === "all" ? "md:grid-cols-2 lg:grid-cols-5" : "lg:grid-cols-3"}`}
        >
          {stats.scope === "all" ? (
            <>
              <KpiCard label="Gov-tagged" accent="emerald">
                <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-emerald-950 sm:text-4xl">
                  {stats.governmentPromises}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {accountabilityProse.statsStripGovernmentKpiFootnote}
                </p>
              </KpiCard>
              <KpiCard label="Not on Gov page" accent="amber">
                <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-amber-950 sm:text-4xl">
                  {notProgrammeInSlice}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">In this slice, not programme-tagged</p>
              </KpiCard>
            </>
          ) : null}
          <KpiCard
            label={accountabilityProse.statsStripMpsWithCatalogueRowsLabel}
            foot="Sitting MP roster in this site"
          >
            <p className="font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
              {stats.mpsWithPromises}
              <span className="ml-1.5 text-lg font-semibold text-slate-500 sm:text-xl">/ {stats.activeMpsTotal}</span>
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">With ≥1 row in this filter slice</p>
          </KpiCard>
          <KpiCard
            label="Published report-card years"
            foot="How many cycles are published on the site — not filtered by pledge table below"
          >
            <p className="font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
              {stats.publishedReportCardCycles}
            </p>
          </KpiCard>
          <KpiCard
            label="Scorecard rows"
            foot="MP lines in published report-card cycles — whole site; not filtered by pledges below"
          >
            <p className="font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
              {stats.reportCardEntriesPublished}
            </p>
          </KpiCard>
        </dl>

        {totalPromises > 0 && compact ? (
          <StatusDonutWithLegend
            met={met}
            inProgress={inProgress}
            broken={broken}
            tracking={tracking}
            fulfilledPct={fulfilledSlicePct}
            variant="dark"
          />
        ) : null}

        {topPolicySectors.length > 0 && totalPromises > 0 && compact ? (
          <PolicyMixStrip rows={topPolicySectors} totalInSlice={totalPromises} variant="dark" />
        ) : null}

        <p className="mt-5 max-w-3xl text-xs leading-relaxed text-slate-400/95 sm:text-sm">
          {accountabilityProse.statsStripDatabaseScopeNote}{" "}
          <Link
            href="/data-sources"
            className="font-medium text-sky-200/95 underline decoration-sky-200/30 underline-offset-2 hover:text-white"
          >
            {accountabilityProse.statsStripDatabaseScopeDataSourcesLink}
          </Link>
        </p>

      </div>

      {totalPromises > 0 && !compact ? (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <StatusDonutWithLegend
            met={met}
            inProgress={inProgress}
            broken={broken}
            tracking={tracking}
            fulfilledPct={fulfilledSlicePct}
            variant="light"
          />
          {topPolicySectors.length > 0 ? (
            <PolicyMixStrip rows={topPolicySectors} totalInSlice={totalPromises} variant="light" />
          ) : null}
        </div>
      ) : null}

      {subtitle ? <p className="text-center text-sm leading-relaxed text-slate-600">{subtitle}</p> : null}

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
