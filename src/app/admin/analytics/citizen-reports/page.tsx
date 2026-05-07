import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminListPanel } from "@/components/admin/AdminListPanel";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";
import {
  getCitizenReportAnalytics,
  parseCitizenReportAnalyticsMonthsParam,
} from "@/lib/server/citizen-report-analytics";

const citizenReportMonthWindowLinkActiveClass = `font-semibold text-[var(--foreground)] underline decoration-2 decoration-[var(--primary)] ${focusRingSmClass}`;

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

      <p className="mt-4 text-sm">
        <span className="text-[var(--muted-foreground)]">Change window:</span>{" "}
        {[6, 12, 24].map((m, i) => (
          <span key={m}>
            {i > 0 ? " · " : null}
            <Link
              href={`/admin/analytics/citizen-reports?months=${m}`}
              className={
                data.windowMonths === m ? citizenReportMonthWindowLinkActiveClass : primaryLinkClass
              }
            >
              {m} months
            </Link>
          </span>
        ))}
      </p>

      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>
          <Link
            href={`/api/admin/analytics/citizen-reports?months=${data.windowMonths}`}
            className={primaryLinkClass}
          >
            JSON API
          </Link>{" "}
          <span className="text-[var(--muted-foreground)]">(same session cookie)</span>
        </span>
        <span>
          <Link
            href={`/api/admin/analytics/citizen-reports/export?months=${data.windowMonths}`}
            className={primaryLinkClass}
          >
            Download CSV
          </Link>{" "}
          <span className="text-[var(--muted-foreground)]">(UTF-8, Excel-friendly)</span>
        </span>
        <span>
          <Link href="/admin/reports" className={primaryLinkClass}>
            ← Report queue
          </Link>
        </span>
      </p>
      <p className="mt-2 max-w-2xl text-xs text-[var(--muted-foreground)]">
        JSON and CSV requests are rate-limited per admin (same <code className="text-[11px]">RATE_LIMIT_*</code> window as
        public forms). If you see <code className="text-[11px]">429</code>, wait a minute or reduce how often you refresh
        automated scripts.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard surface="tile" valueSize="xl" label="All-time total" value={data.totals.all} />
        <AdminMetricCard surface="tile" valueSize="xl" label="In window" value={data.totals.inWindow} />
        <AdminMetricCard
          surface="tile"
          valueSize="xl"
          label="With attachments"
          value={data.totals.withAttachments}
        />
        <AdminMetricCard
          surface="tile"
          valueSize="xl"
          label="SLA overdue (open)"
          value={data.totals.slaOpenOverdue}
        />
      </section>

      <AdminSectionCard className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Public causes (counts only)</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Reports with a staff-approved public thread slug — not a substitute for moderation metrics on{" "}
          <Link href="/admin/public-causes" className={primaryLinkClass}>
            Public causes
          </Link>
          .
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">With thread</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-[var(--foreground)]">
              {data.publicCauses.withThread}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Live thread</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-[var(--foreground)]">
              {data.publicCauses.threadLive}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Closed thread</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-[var(--foreground)]">
              {data.publicCauses.threadClosed}
            </dd>
          </div>
        </dl>
      </AdminSectionCard>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By kind (window)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(data.totals.byKindInWindow).length === 0 ? (
              <li>
                <AdminEmptyState message="No rows." />
              </li>
            ) : (
              Object.entries(data.totals.byKindInWindow).map(([k, n]) => (
                <li key={k} className="flex justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{kindLabels[k] ?? k}</span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{n}</span>
                </li>
              ))
            )}
          </ul>
        </AdminSectionCard>
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By status (window)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(data.totals.byStatusInWindow).length === 0 ? (
              <li>
                <AdminEmptyState message="No rows." />
              </li>
            ) : (
              Object.entries(data.totals.byStatusInWindow).map(([s, n]) => (
                <li key={s} className="flex justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{statusLabels[s] ?? s}</span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{n}</span>
                </li>
              ))
            )}
          </ul>
        </AdminSectionCard>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By kind (all-time)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(data.totals.byKind).length === 0 ? (
              <li>
                <AdminEmptyState message="No rows." />
              </li>
            ) : (
              Object.entries(data.totals.byKind).map(([k, n]) => (
                <li key={k} className="flex justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{kindLabels[k] ?? k}</span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{n}</span>
                </li>
              ))
            )}
          </ul>
        </AdminSectionCard>
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By status (all-time)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(data.totals.byStatus).length === 0 ? (
              <li>
                <AdminEmptyState message="No rows." />
              </li>
            ) : (
              Object.entries(data.totals.byStatus).map(([s, n]) => (
                <li key={s} className="flex justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{statusLabels[s] ?? s}</span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{n}</span>
                </li>
              ))
            )}
          </ul>
        </AdminSectionCard>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Ops playbook tag (all-time)</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            From <code className="rounded bg-[var(--section-light)] px-1 py-0.5 text-[11px]">operationsPlaybookKey</code>{" "}
            on each report.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {data.byPlaybookAll.length === 0 ? (
              <li>
                <AdminEmptyState message="No rows." />
              </li>
            ) : (
              data.byPlaybookAll.map((row) => (
                <li key={row.key || "__unset__"} className="flex justify-between gap-2">
                  <span className="font-mono text-xs text-[var(--muted-foreground)]">
                    {row.key || "(unassigned)"}
                  </span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </AdminSectionCard>
        <AdminSectionCard>
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Ops playbook tag (window)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.byPlaybookInWindow.length === 0 ? (
              <li>
                <AdminEmptyState message="No rows." />
              </li>
            ) : (
              data.byPlaybookInWindow.map((row) => (
                <li key={`${row.key}-w`} className="flex justify-between gap-2">
                  <span className="font-mono text-xs text-[var(--muted-foreground)]">
                    {row.key || "(unassigned)"}
                  </span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </AdminSectionCard>
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">By region (all-time)</h2>
        {data.byRegion.length === 0 ? (
          <AdminEmptyState message="No region tagged reports yet." className="mt-2" />
        ) : (
          <AdminListPanel className="mt-3 rounded-xl">
            {data.byRegion.map((r) => (
              <li key={r.regionId} className="flex justify-between gap-2 px-4 py-2 text-sm">
                <span className="text-[var(--foreground)]">{r.regionName}</span>
                <span className="tabular-nums text-[var(--muted-foreground)]">{r.count}</span>
              </li>
            ))}
          </AdminListPanel>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">By month (window)</h2>
        {data.byMonth.length === 0 ? (
          <AdminEmptyState message="No reports in this window." className="mt-2" />
        ) : (
          <AdminListPanel className="mt-3 rounded-xl">
            {data.byMonth.map((row) => (
              <li key={row.yearMonth} className="flex justify-between gap-2 px-4 py-2 text-sm">
                <span className="font-mono text-[var(--foreground)]">{row.yearMonth}</span>
                <span className="tabular-nums text-[var(--muted-foreground)]">{row.count}</span>
              </li>
            ))}
          </AdminListPanel>
        )}
      </section>
    </AdminPageContainer>
  );
}
