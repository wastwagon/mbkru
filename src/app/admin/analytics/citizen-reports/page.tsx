import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminWindowFilterChips } from "@/components/admin/AdminWindowFilterChips";
import { GhanaRegionsReportHeatMap } from "@/components/transparency/GhanaRegionsReportHeatMap";
import { MonthTrendBars } from "@/components/viz/MonthTrendBars";
import { StatBarList } from "@/components/viz/StatBarList";
import { StatusDonut } from "@/components/viz/StatusDonut";
import { requireAdminSession } from "@/lib/admin/require-session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import {
  getCitizenReportAnalytics,
  parseCitizenReportAnalyticsMonthsParam,
} from "@/lib/server/citizen-report-analytics";

type Props = { searchParams?: Promise<{ months?: string | string[] }> };

export default async function AdminCitizenReportAnalyticsPage({ searchParams }: Props) {
  await requireAdminSession();

  const sp = (await searchParams) ?? {};
  const monthsParam = sp.months;
  const monthsFirst = Array.isArray(monthsParam) ? monthsParam[0] : monthsParam;
  const months = parseCitizenReportAnalyticsMonthsParam(
    monthsFirst !== undefined && monthsFirst !== "" ? String(monthsFirst) : null,
  );

  if (!isDatabaseConfigured()) {
    return (
      <AdminPageContainer>
        <AdminPageHeader title="Citizen report analytics" description="Database is not configured." />
      </AdminPageContainer>
    );
  }

  const data = await getCitizenReportAnalytics(months);

  const kindLabels: Record<string, string> = {
    VOICE: "Voice",
    MP_PERFORMANCE: "MP performance",
    GOVERNMENT_PERFORMANCE: "Government performance",
    SITUATIONAL_ALERT: "Situational alert",
    ELECTION_OBSERVATION: "Election observation",
  };
  const statusLabels: Record<string, string> = {
    RECEIVED: "Received",
    UNDER_REVIEW: "Under review",
    ESCALATED: "Escalated",
    CLOSED: "Closed",
    ARCHIVED: "Archived",
  };

  const kindWindowItems = Object.entries(data.totals.byKindInWindow)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => ({ key: k, label: kindLabels[k] ?? k, count: n }));

  const statusWindowItems = Object.entries(data.totals.byStatusInWindow)
    .sort((a, b) => b[1] - a[1])
    .map(([s, n]) => ({ key: s, label: statusLabels[s] ?? s, count: n }));

  const kindAllItems = Object.entries(data.totals.byKind)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => ({ key: k, label: kindLabels[k] ?? k, count: n }));

  const statusAllItems = Object.entries(data.totals.byStatus)
    .sort((a, b) => b[1] - a[1])
    .map(([s, n]) => ({ key: s, label: statusLabels[s] ?? s, count: n }));

  const playbookAllItems = data.byPlaybookAll.map((row) => ({
    key: row.key || "__unset__",
    label: row.key || "(unassigned)",
    count: row.count,
  }));

  const playbookWindowItems = data.byPlaybookInWindow.map((row) => ({
    key: `${row.key || "__unset__"}-w`,
    label: row.key || "(unassigned)",
    count: row.count,
  }));

  const windowShare =
    data.totals.all > 0 ? Math.round((data.totals.inWindow / data.totals.all) * 100) : 0;
  const slaTone =
    data.totals.slaOpenOverdue > 0
      ? ("danger" as const)
      : data.totals.slaOpenOverdue === 0
        ? ("success" as const)
        : ("neutral" as const);

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Citizen report analytics"
        description={
          <>
            <p>Non-identifying aggregates for triage and reporting.</p>
            <p className="mt-2">
              Window: last <strong>{data.windowMonths}</strong> month(s) (since{" "}
              {new Date(data.windowSince).toLocaleDateString("en-GB")}).
            </p>
            <p className="mt-1 font-mono text-xs">Generated {data.generatedAt}</p>
          </>
        }
      />

      <AdminWindowFilterChips
        className="mt-4"
        hrefBase="/admin/analytics/citizen-reports"
        param="months"
        active={data.windowMonths}
        options={[
          { value: 6, label: "6 months" },
          { value: 12, label: "12 months" },
          { value: 24, label: "24 months" },
        ]}
      />

      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>
          <Link
            href={`/api/admin/analytics/citizen-reports?months=${data.windowMonths}`}
            className={primaryLinkClass}
          >
            JSON API
          </Link>{" "}
          <span className="text-[var(--foreground-secondary)]">(same session cookie)</span>
        </span>
        <span>
          <Link
            href={`/api/admin/analytics/citizen-reports/export?months=${data.windowMonths}`}
            className={primaryLinkClass}
          >
            Download CSV
          </Link>{" "}
          <span className="text-[var(--foreground-secondary)]">(UTF-8, Excel-friendly)</span>
        </span>
        <span>
          <Link href="/admin/reports" className={primaryLinkClass}>
            ← Report queue
          </Link>
        </span>
      </p>
      <p className="mt-2 max-w-2xl text-xs text-[var(--foreground-secondary)]">
        JSON and CSV requests are rate-limited per admin (same <code className="text-[11px]">RATE_LIMIT_*</code> window as
        public forms). If you see <code className="text-[11px]">429</code>, wait a minute or reduce how often you refresh
        automated scripts.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          surface="tile"
          valueSize="xl"
          label="All-time total"
          hint="Every citizen report in the database (training rows may be excluded on public surfaces)."
          value={data.totals.all}
          subline="Every tagged report"
        />
        <AdminMetricCard
          surface="tile"
          valueSize="xl"
          label="In window"
          hint={`Reports created since ${new Date(data.windowSince).toLocaleDateString("en-GB")}.`}
          value={data.totals.inWindow}
          delta={data.totals.all > 0 ? `${windowShare}% of all` : undefined}
          deltaTone="info"
          subline={`Last ${data.windowMonths} months`}
        />
        <AdminMetricCard
          surface="tile"
          valueSize="xl"
          label="With attachments"
          hint="All-time reports that include at least one uploaded file."
          value={data.totals.withAttachments}
          subline="All-time"
        />
        <AdminMetricCard
          surface="tile"
          valueSize="xl"
          label="SLA overdue (open)"
          hint="Open reports whose slaDueAt is in the past — triage these first."
          value={data.totals.slaOpenOverdue}
          delta={data.totals.slaOpenOverdue > 0 ? "Needs triage" : "Clear"}
          deltaTone={slaTone}
          subline={
            <Link href="/admin/reports" className={primaryLinkClass}>
              Open queue
            </Link>
          }
        />
      </section>

      <AdminSectionCard className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Public causes (counts only)</h2>
        <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
          Reports with a staff-approved public thread slug — not a substitute for moderation metrics on{" "}
          <Link href="/admin/public-causes" className={primaryLinkClass}>
            Public causes
          </Link>
          .
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-secondary)]">
              With thread
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-[var(--foreground)]">
              {data.publicCauses.withThread}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-secondary)]">
              Live thread
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-[var(--foreground)]">
              {data.publicCauses.threadLive}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-secondary)]">
              Closed thread
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-[var(--foreground)]">
              {data.publicCauses.threadClosed}
            </dd>
          </div>
        </dl>
      </AdminSectionCard>

      <AdminSectionCard className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Submission trend</h2>
        <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
          Reports received per month in the selected window.
        </p>
        {data.byMonth.length === 0 ? (
          <AdminEmptyState
            className="mt-4"
            title="No submissions in window"
            message="Widen the month window or check the report queue."
            action={{ href: "/admin/reports", label: "Open report queue" }}
          />
        ) : (
          <MonthTrendBars months={data.byMonth} ariaLabel="Monthly citizen report submissions" />
        )}
      </AdminSectionCard>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By kind (window)</h2>
          {kindWindowItems.length === 0 ? (
            <AdminEmptyState
              className="mt-4"
              title="No kinds in window"
              message="Widen the month window or wait for new submissions."
              action={{ href: "/admin/reports", label: "Open report queue" }}
            />
          ) : (
            <StatBarList items={kindWindowItems} />
          )}
        </AdminSectionCard>
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By status (window)</h2>
          {statusWindowItems.length === 0 ? (
            <AdminEmptyState
              className="mt-4"
              title="No statuses in window"
              message="Widen the month window or check the triage queue."
              action={{ href: "/admin/reports", label: "Open report queue" }}
            />
          ) : (
            <StatusDonut items={statusWindowItems} centerCaption="In window" />
          )}
        </AdminSectionCard>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By kind (all-time)</h2>
          {kindAllItems.length === 0 ? (
            <AdminEmptyState
              className="mt-4"
              title="No reports yet"
              message="Citizen reports will appear here once the queue receives submissions."
              action={{ href: "/admin/reports", label: "Open report queue" }}
            />
          ) : (
            <StatBarList items={kindAllItems} maxCount={Math.max(1, data.totals.all)} />
          )}
        </AdminSectionCard>
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By status (all-time)</h2>
          {statusAllItems.length === 0 ? (
            <AdminEmptyState
              className="mt-4"
              title="No status breakdown yet"
              message="Workflow statuses populate as reports move through triage."
              action={{ href: "/admin/reports", label: "Open report queue" }}
            />
          ) : (
            <StatusDonut items={statusAllItems} centerCaption="All time" />
          )}
        </AdminSectionCard>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Ops playbook tag (all-time)</h2>
          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
            From <code className="rounded bg-[var(--section-light)] px-1 py-0.5 text-[11px]">operationsPlaybookKey</code>{" "}
            on each report.
          </p>
          {playbookAllItems.length === 0 ? (
            <AdminEmptyState
              className="mt-4"
              title="No playbook tags yet"
              message="Assign an operations playbook key on a report to start tracking tags."
              action={{ href: "/admin/reports", label: "Open report queue" }}
            />
          ) : (
            <StatBarList items={playbookAllItems} />
          )}
        </AdminSectionCard>
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Ops playbook tag (window)</h2>
          {playbookWindowItems.length === 0 ? (
            <AdminEmptyState
              className="mt-4"
              title="No playbook tags in window"
              message="Widen the month window or tag reports during triage."
              action={{ href: "/admin/reports", label: "Open report queue" }}
            />
          ) : (
            <StatBarList items={playbookWindowItems} />
          )}
        </AdminSectionCard>
      </div>

      <section className="mt-10 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Regional heat map</h2>
          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
            All-time counts by tagged region — ranking is in the table under the map.
          </p>
          {data.byRegion.length === 0 ? (
            <AdminEmptyState
              className="mt-3"
              title="No region-tagged reports"
              message="Reports need a region tag before they appear on the map."
              action={{ href: "/admin/reports", label: "Open report queue" }}
            />
          ) : (
            <div className="mt-3">
              <GhanaRegionsReportHeatMap regions={data.byRegion} />
            </div>
          )}
        </div>
      </section>
    </AdminPageContainer>
  );
}
