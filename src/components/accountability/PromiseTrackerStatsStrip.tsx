import Link from "next/link";

import type { PromiseTrackerStats } from "@/lib/server/promise-tracker-stats";

type Props = {
  stats: PromiseTrackerStats;
  /** Shown under the headline metrics */
  subtitle?: string;
};

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

export function PromiseTrackerStatsStrip({ stats, subtitle }: Props) {
  const { byStatus, totalPromises } = stats;
  const met = byStatus.FULFILLED ?? 0;
  const inProgress = byStatus.IN_PROGRESS ?? 0;
  const broken = byStatus.BROKEN ?? 0;
  const tracking = (byStatus.TRACKING ?? 0) + (byStatus.DEFERRED ?? 0);
  const barTotal = Math.max(1, met + inProgress + broken + tracking);

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--foreground)] px-4 py-4 text-white shadow-md sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Tracker snapshot</p>
            <p className="mt-1 text-sm text-white/85">
              {stats.scope === "government"
                ? "Government-programme commitments in the public catalogue."
                : "Live counts from the campaign-promise database (not macro-economic statistics)."}
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
            Data live
          </span>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          <div className="rounded-xl bg-white/10 px-3 py-2.5">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-white/60">
              {stats.scope === "government" ? "Gov commitments" : "Promises tracked"}
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{stats.totalPromises}</dd>
          </div>
          {stats.scope === "all" ? (
            <div className="rounded-xl bg-white/10 px-3 py-2.5">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-white/60">Gov-tagged</dt>
              <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{stats.governmentPromises}</dd>
            </div>
          ) : null}
          <div className="rounded-xl bg-white/10 px-3 py-2.5">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-white/60">MPs w/ promises</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums">
              {stats.mpsWithPromises}
              <span className="ml-1 text-sm font-normal text-white/60">/ {stats.activeMpsTotal}</span>
            </dd>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2.5">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-white/60">Report card cycles</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{stats.publishedReportCardCycles}</dd>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2.5">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-white/60">Scorecard rows</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{stats.reportCardEntriesPublished}</dd>
          </div>
        </dl>
      </div>

      {totalPromises > 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--foreground)]">Commitment status mix</p>
            <p className="text-xs text-[var(--muted-foreground)]">{totalPromises} in this view</p>
          </div>
          <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-[var(--section-light)]">
            <span
              className="h-full bg-emerald-500"
              style={{ width: `${pct(met, barTotal)}%` }}
              title={`Fulfilled: ${met}`}
            />
            <span
              className="h-full bg-sky-500"
              style={{ width: `${pct(inProgress, barTotal)}%` }}
              title={`In progress: ${inProgress}`}
            />
            <span
              className="h-full bg-rose-500"
              style={{ width: `${pct(broken, barTotal)}%` }}
              title={`Broken: ${broken}`}
            />
            <span
              className="h-full bg-slate-300"
              style={{ width: `${pct(tracking, barTotal)}%` }}
              title={`Tracking / deferred: ${tracking}`}
            />
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
            <li>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Fulfilled {met}
            </li>
            <li>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-sky-500" aria-hidden />
              In progress {inProgress}
            </li>
            <li>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-500" aria-hidden />
              Broken {broken}
            </li>
            <li>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-300" aria-hidden />
              Tracking / deferred {tracking}
            </li>
          </ul>
        </div>
      ) : null}

      {subtitle ? <p className="text-center text-xs text-[var(--muted-foreground)]">{subtitle}</p> : null}

      <p className="text-center text-xs text-[var(--muted-foreground)]">
        <strong className="text-[var(--foreground)]">JSON API</strong> — read-only{" "}
        <Link href="/api/promises" className="text-[var(--primary)] hover:underline">
          GET /api/promises
        </Link>{" "}
        returns the same rows the live search uses (filters:{" "}
        <code className="rounded bg-[var(--section-light)] px-1">q</code>,{" "}
        <code className="rounded bg-[var(--section-light)] px-1">policySector</code>,{" "}
        <code className="rounded bg-[var(--section-light)] px-1">status</code>,{" "}
        <code className="rounded bg-[var(--section-light)] px-1">governmentOnly</code>
        ). Rate-limited for public use.
      </p>
    </div>
  );
}
