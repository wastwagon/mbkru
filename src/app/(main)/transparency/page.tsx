import type { CitizenReportKind, CitizenReportStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { isPublicVoiceStatisticsEnabled } from "@/lib/reports/accountability-pages";
import { getCitizenReportAnalytics } from "@/lib/server/citizen-report-analytics";
import { reportKindLabel, reportStatusLabel } from "@/lib/report-status-text";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Voice statistics",
  description:
    "Aggregate MBKRU Voice reporting statistics — counts by kind, status, and region. No personal data or report text.",
};

export default async function TransparencyPage() {
  if (!isPublicVoiceStatisticsEnabled() || !isDatabaseConfigured()) notFound();

  const analytics = await getCitizenReportAnalytics(12);
  const maxRegion = Math.max(1, ...analytics.byRegion.map((r) => r.count));

  return (
    <div>
      <PageHeader
        title="Voice statistics"
        description="Aggregated, non-identifying counts from reports received through MBKRU Voice and related channels on this deployment. Updated on each page load; not a live API feed."
        breadcrumbCurrentLabel="Transparency"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-4xl space-y-10 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/citizens-voice" className="font-medium text-[var(--primary)] hover:underline">
              MBKRU Voice
            </Link>
            {" · "}
            <Link href="/methodology" className="font-medium text-[var(--primary)] hover:underline">
              Methodology
            </Link>
            {" · "}
            <Link href="/data-sources" className="font-medium text-[var(--primary)] hover:underline">
              Data sources
            </Link>
          </p>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Totals</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Window: last {analytics.windowMonths} months (from {new Date(analytics.windowSince).toLocaleDateString("en-GB")}).
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/40 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">All time</dt>
                <dd className="mt-1 font-display text-2xl font-bold text-[var(--foreground)]">{analytics.totals.all}</dd>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/40 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">In window</dt>
                <dd className="mt-1 font-display text-2xl font-bold text-[var(--foreground)]">{analytics.totals.inWindow}</dd>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/40 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">With attachments</dt>
                <dd className="mt-1 font-display text-2xl font-bold text-[var(--foreground)]">{analytics.totals.withAttachments}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">By kind</h2>
            {Object.keys(analytics.totals.byKind).length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">No reports yet — counts will appear here after intake begins.</p>
            ) : null}
            <ul className="mt-4 space-y-3">
              {Object.entries(analytics.totals.byKind).map(([kind, count]) => (
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
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">By status</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {Object.entries(analytics.totals.byStatus).map(([status, count]) => (
                <li key={status} className="flex justify-between gap-3 border-b border-[var(--border)]/60 py-2 last:border-0">
                  <span className="text-[var(--muted-foreground)]">{reportStatusLabel(status as CitizenReportStatus)}</span>
                  <span className="font-semibold tabular-nums text-[var(--foreground)]">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          {analytics.byRegion.length > 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">By region (where tagged)</h2>
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

          <p className="text-center text-xs text-[var(--muted-foreground)]">
            Generated {new Date(analytics.generatedAt).toLocaleString("en-GB")}. Staff dashboards may include additional operational metrics.
          </p>
        </div>
      </section>
    </div>
  );
}
