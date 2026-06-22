"use client";

import type { CitizenReportKind, CitizenReportStatus } from "@prisma/client";
import Link from "next/link";

import { GhanaRegionsReportHeatMap } from "@/components/transparency/GhanaRegionsReportHeatMap";
import { DataFreshnessBadge } from "@/components/ui/DataFreshnessBadge";
import type { CitizenReportAnalytics } from "@/lib/citizen-report-analytics-shared";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel, reportStatusLabel } from "@/lib/report-status-text";

type Props = {
  analytics: CitizenReportAnalytics;
};

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: "rgb(148 163 184)",
  UNDER_REVIEW: "rgb(14 165 233)",
  REFERRED: "rgb(99 102 241)",
  RESOLVED: "rgb(16 185 129)",
  CLOSED: "rgb(100 116 139)",
  REJECTED: "rgb(244 63 94)",
};

function statusConicGradient(entries: [string, number][]): string {
  const total = entries.reduce((s, [, c]) => s + c, 0);
  if (total <= 0) return "transparent 0% 100%";
  let cursor = 0;
  const stops: string[] = [];
  for (const [status, count] of entries) {
    if (count <= 0) continue;
    const pct = (count / total) * 100;
    const color = STATUS_COLORS[status] ?? "rgb(148 163 184)";
    stops.push(`${color} ${cursor}% ${cursor + pct}%`);
    cursor += pct;
  }
  return stops.join(", ");
}

function formatMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

export function VoiceStatisticsDashboard({ analytics }: Props) {
  const maxRegion = Math.max(1, ...analytics.byRegion.map((r) => r.count));
  const maxMonth = Math.max(1, ...analytics.byMonth.map((m) => m.count));
  const statusEntries = Object.entries(analytics.totals.byStatusInWindow).sort((a, b) => b[1] - a[1]);
  const statusTotal = statusEntries.reduce((s, [, c]) => s + c, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
          Aggregate counts only — no personal data or report text. Figures refresh on each page load.
        </p>
        <DataFreshnessBadge generatedAt={analytics.generatedAt} />
      </div>

      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-[var(--foreground-secondary)]">
        <Link href="/citizens-voice" className={primaryNavLinkClass}>
          MBKRU Voice
        </Link>
        <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
          ·
        </span>
        <Link href="/methodology" className={primaryNavLinkClass}>
          Methodology
        </Link>
        <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
          ·
        </span>
        <Link href="/data-sources" className={primaryNavLinkClass}>
          Data sources
        </Link>
      </p>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "All time", value: analytics.totals.all, accent: "text-[var(--primary)]", border: "border-[var(--primary)]/20 bg-[var(--primary)]/6" },
          {
            label: `Last ${analytics.windowMonths} months`,
            value: analytics.totals.inWindow,
            accent: "text-[var(--accent-gold)]",
            border: "border-[var(--accent-gold)]/30 bg-[var(--accent-gold-light)]",
          },
          {
            label: "With attachments",
            value: analytics.totals.withAttachments,
            accent: "text-[var(--foreground)]",
            border: "border-[var(--border)] bg-[var(--section-light)]/40",
          },
          {
            label: "Public cause threads",
            value: analytics.publicCauses.withThread,
            accent: "text-[var(--foreground)]",
            border: "border-[var(--border)] bg-white",
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-2xl border p-5 shadow-sm ${kpi.border}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-secondary)]">{kpi.label}</p>
            <p className={`mt-2 font-display text-3xl font-bold tabular-nums ${kpi.accent}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly trend */}
      {analytics.byMonth.length > 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Submission trend</h2>
          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
            Reports received per month since {new Date(analytics.windowSince).toLocaleDateString("en-GB")}.
          </p>
          <div className="mt-6 flex items-end gap-1.5 sm:gap-2" role="img" aria-label="Monthly submission bar chart">
            {analytics.byMonth.map((m) => {
              const h = Math.max(4, (m.count / maxMonth) * 100);
              return (
                <div key={m.yearMonth} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-semibold tabular-nums text-[var(--primary)] sm:text-xs">{m.count}</span>
                  <div className="flex h-28 w-full items-end sm:h-36">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-[var(--primary-dark)] to-[var(--primary)]/85 transition-all"
                      style={{ height: `${h}%` }}
                      title={`${formatMonthLabel(m.yearMonth)}: ${m.count}`}
                    />
                  </div>
                  <span className="max-w-full truncate text-[9px] font-medium text-[var(--foreground-secondary)] sm:text-[10px]">
                    {formatMonthLabel(m.yearMonth)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* By kind */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">By kind</h2>
          {Object.keys(analytics.totals.byKind).length === 0 ? (
            <p className="mt-4 text-sm text-[var(--foreground-secondary)]">No reports yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {Object.entries(analytics.totals.byKind)
                .sort((a, b) => b[1] - a[1])
                .map(([kind, count]) => (
                  <li key={kind}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-[var(--foreground)]">{reportKindLabel(kind as CitizenReportKind)}</span>
                      <span className="font-semibold tabular-nums text-[var(--primary)]">{count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--section-light)]">
                      <div
                        className="h-full rounded-full bg-[var(--primary)]/80"
                        style={{
                          width: `${Math.min(100, analytics.totals.all ? (count / analytics.totals.all) * 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Status donut */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Workflow status</h2>
          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">In the last {analytics.windowMonths} months.</p>
          {statusTotal === 0 ? (
            <p className="mt-4 text-sm text-[var(--foreground-secondary)]">No reports in window.</p>
          ) : (
            <div className="mt-6 flex flex-wrap items-start gap-8">
              <div className="relative mx-auto h-36 w-36 shrink-0 sm:mx-0">
                <div
                  className="absolute inset-0 rounded-full shadow-inner ring-1 ring-black/5"
                  style={{ background: `conic-gradient(${statusConicGradient(statusEntries)})` }}
                />
                <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                  <span className="font-display text-2xl font-bold tabular-nums text-[var(--foreground)]">{statusTotal}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--foreground-secondary)]">In window</span>
                </div>
              </div>
              <ul className="min-w-0 flex-1 space-y-2 text-sm">
                {statusEntries.map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: STATUS_COLORS[status] ?? "rgb(148 163 184)" }}
                        aria-hidden
                      />
                      {reportStatusLabel(status as CitizenReportStatus)}
                    </span>
                    <span className="font-semibold tabular-nums text-[var(--foreground)]">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Regional heat map + list */}
      <GhanaRegionsReportHeatMap regions={analytics.byRegion} />

      {analytics.byRegion.length > 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Regional ranking</h2>
          <ul className="mt-4 space-y-3">
            {analytics.byRegion.map((r) => (
              <li key={r.regionId}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[var(--foreground)]">{r.regionName}</span>
                  <span className="font-semibold tabular-nums text-[var(--primary)]">{r.count}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--section-light)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent-gold)]/90"
                    style={{ width: `${Math.min(100, (r.count / maxRegion) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
