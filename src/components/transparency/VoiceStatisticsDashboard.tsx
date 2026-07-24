import type { CitizenReportKind, CitizenReportStatus } from "@prisma/client";
import Link from "next/link";

import { GhanaRegionsReportHeatMap } from "@/components/transparency/GhanaRegionsReportHeatMap";
import { MonthTrendBars } from "@/components/viz/MonthTrendBars";
import { StatBarList } from "@/components/viz/StatBarList";
import { StatusDonut } from "@/components/viz/StatusDonut";
import type { CitizenReportAnalytics } from "@/lib/citizen-report-analytics-shared";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel, reportStatusLabel } from "@/lib/report-status-text";

type Props = {
  analytics: CitizenReportAnalytics;
};

export function VoiceStatisticsDashboard({ analytics }: Props) {
  const kindItems = Object.entries(analytics.totals.byKind)
    .sort((a, b) => b[1] - a[1])
    .map(([kind, count]) => ({
      key: kind,
      label: reportKindLabel(kind as CitizenReportKind),
      count,
    }));

  const statusItems = Object.entries(analytics.totals.byStatusInWindow)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({
      key: status,
      label: reportStatusLabel(status as CitizenReportStatus),
      count,
    }));

  const regionItems = analytics.byRegion.map((r) => ({
    key: r.regionId,
    label: r.regionName,
    count: r.count,
  }));

  const csvHref = `/api/export/citizen-report-analytics-csv?months=${analytics.windowMonths}`;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
        <p className="min-w-0 flex-1">
          Aggregate counts only — no personal data or report text. Figures refresh on each page load.
        </p>
        <Link
          href={csvHref}
          className={`${primaryLinkClass} shrink-0 font-semibold`}
          download
          prefetch={false}
        >
          Download CSV
        </Link>
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
        <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
          ·
        </span>
        <Link href="/partner-api" className={primaryNavLinkClass}>
          Partner API
        </Link>
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "All time",
            value: analytics.totals.all,
            accent: "text-[var(--primary)]",
            border: "border-[var(--primary)]/20 bg-[var(--primary)]/6",
          },
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-secondary)]">
              {kpi.label}
            </p>
            <p className={`mt-2 font-display text-3xl font-bold tabular-nums ${kpi.accent}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {analytics.byMonth.length > 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Submission trend</h2>
          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
            Reports received per month since {new Date(analytics.windowSince).toLocaleDateString("en-GB")}.
          </p>
          <MonthTrendBars months={analytics.byMonth} ariaLabel="Monthly submission bar chart" />
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">By kind</h2>
          <StatBarList
            items={kindItems}
            maxCount={Math.max(1, analytics.totals.all)}
            emptyMessage="No reports yet."
          />
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Workflow status</h2>
          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
            In the last {analytics.windowMonths} months.
          </p>
          <StatusDonut items={statusItems} centerCaption="In window" emptyMessage="No reports in window." />
        </div>
      </div>

      <GhanaRegionsReportHeatMap regions={analytics.byRegion} />

      {analytics.byRegion.length > 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Regional ranking</h2>
          <StatBarList items={regionItems} accent="gold" />
        </div>
      ) : null}
    </div>
  );
}
