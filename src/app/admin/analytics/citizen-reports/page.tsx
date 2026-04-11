import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
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
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-sm text-[var(--muted-foreground)]">
          <Link href="/admin" className="text-[var(--primary)] hover:underline">
            ← Admin
          </Link>
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">Citizen report analytics</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Database is not configured.</p>
      </div>
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className="text-[var(--primary)] hover:underline">
          ← Admin
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">Citizen report analytics</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Non-identifying aggregates for triage and reporting. Window: last{" "}
        <strong>{data.windowMonths}</strong> month(s) (since {new Date(data.windowSince).toLocaleDateString("en-GB")}).
      </p>
      <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">Generated {data.generatedAt}</p>

      <p className="mt-4 text-sm">
        <span className="text-[var(--muted-foreground)]">Change window:</span>{" "}
        {[6, 12, 24].map((m, i) => (
          <span key={m}>
            {i > 0 ? " · " : null}
            <Link
              href={`/admin/analytics/citizen-reports?months=${m}`}
              className={
                data.windowMonths === m
                  ? "font-semibold text-[var(--foreground)] underline decoration-2 decoration-[var(--primary)]"
                  : "text-[var(--primary)] hover:underline"
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
            className="text-[var(--primary)] hover:underline"
          >
            JSON API
          </Link>{" "}
          <span className="text-[var(--muted-foreground)]">(same session cookie)</span>
        </span>
        <span>
          <Link
            href={`/api/admin/analytics/citizen-reports/export?months=${data.windowMonths}`}
            className="text-[var(--primary)] hover:underline"
          >
            Download CSV
          </Link>{" "}
          <span className="text-[var(--muted-foreground)]">(UTF-8, Excel-friendly)</span>
        </span>
        <span>
          <Link href="/admin/reports" className="text-[var(--primary)] hover:underline">
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
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">All-time total</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">
            {data.totals.all}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">In window</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">
            {data.totals.inWindow}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">With attachments</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">
            {data.totals.withAttachments}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            SLA overdue (open)
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">
            {data.totals.slaOpenOverdue}
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Public causes (counts only)</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Reports with a staff-approved public thread slug — not a substitute for moderation metrics on{" "}
          <Link href="/admin/public-causes" className="text-[var(--primary)] hover:underline">
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
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By kind (window)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(data.totals.byKindInWindow).length === 0 ? (
              <li className="text-[var(--muted-foreground)]">No rows.</li>
            ) : (
              Object.entries(data.totals.byKindInWindow).map(([k, n]) => (
                <li key={k} className="flex justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{kindLabels[k] ?? k}</span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{n}</span>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By status (window)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(data.totals.byStatusInWindow).length === 0 ? (
              <li className="text-[var(--muted-foreground)]">No rows.</li>
            ) : (
              Object.entries(data.totals.byStatusInWindow).map(([s, n]) => (
                <li key={s} className="flex justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{statusLabels[s] ?? s}</span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{n}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By kind (all-time)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(data.totals.byKind).length === 0 ? (
              <li className="text-[var(--muted-foreground)]">No rows.</li>
            ) : (
              Object.entries(data.totals.byKind).map(([k, n]) => (
                <li key={k} className="flex justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{kindLabels[k] ?? k}</span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{n}</span>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By status (all-time)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.keys(data.totals.byStatus).length === 0 ? (
              <li className="text-[var(--muted-foreground)]">No rows.</li>
            ) : (
              Object.entries(data.totals.byStatus).map(([s, n]) => (
                <li key={s} className="flex justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{statusLabels[s] ?? s}</span>
                  <span className="tabular-nums font-medium text-[var(--foreground)]">{n}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Ops playbook tag (all-time)</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            From <code className="rounded bg-[var(--section-light)] px-1 py-0.5 text-[11px]">operationsPlaybookKey</code>{" "}
            on each report.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {data.byPlaybookAll.length === 0 ? (
              <li className="text-[var(--muted-foreground)]">No rows.</li>
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
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Ops playbook tag (window)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {data.byPlaybookInWindow.length === 0 ? (
              <li className="text-[var(--muted-foreground)]">No rows.</li>
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
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">By region (all-time)</h2>
        {data.byRegion.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">No region tagged reports yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
            {data.byRegion.map((r) => (
              <li key={r.regionId} className="flex justify-between gap-2 px-4 py-2 text-sm">
                <span className="text-[var(--foreground)]">{r.regionName}</span>
                <span className="tabular-nums text-[var(--muted-foreground)]">{r.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">By month (window)</h2>
        {data.byMonth.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">No reports in this window.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
            {data.byMonth.map((row) => (
              <li key={row.yearMonth} className="flex justify-between gap-2 px-4 py-2 text-sm">
                <span className="font-mono text-[var(--foreground)]">{row.yearMonth}</span>
                <span className="tabular-nums text-[var(--muted-foreground)]">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
