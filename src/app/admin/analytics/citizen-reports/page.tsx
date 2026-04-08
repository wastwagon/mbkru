import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getCitizenReportAnalytics } from "@/lib/server/citizen-report-analytics";

type Props = { searchParams?: Promise<{ months?: string }> };

export default async function AdminCitizenReportAnalyticsPage({ searchParams }: Props) {
  await requireAdminSession();

  const sp = (await searchParams) ?? {};
  const monthsRaw = sp.months;
  const monthsParsed = monthsRaw !== undefined ? Number.parseInt(String(monthsRaw), 10) : undefined;
  const months = Number.isFinite(monthsParsed) ? monthsParsed : undefined;

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
        <Link
          href="/admin/analytics/citizen-reports?months=6"
          className="text-[var(--primary)] hover:underline"
        >
          6 months
        </Link>
        {" · "}
        <Link
          href="/admin/analytics/citizen-reports?months=12"
          className="text-[var(--primary)] hover:underline"
        >
          12 months
        </Link>
        {" · "}
        <Link
          href="/admin/analytics/citizen-reports?months=24"
          className="text-[var(--primary)] hover:underline"
        >
          24 months
        </Link>
      </p>

      <p className="mt-2 text-sm">
        <Link href="/api/admin/analytics/citizen-reports" className="text-[var(--primary)] hover:underline">
          JSON API
        </Link>{" "}
        <span className="text-[var(--muted-foreground)]">(same session cookie)</span>
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

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By kind (window)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.entries(data.totals.byKindInWindow).map(([k, n]) => (
              <li key={k} className="flex justify-between gap-2">
                <span className="text-[var(--muted-foreground)]">{kindLabels[k] ?? k}</span>
                <span className="tabular-nums font-medium text-[var(--foreground)]">{n}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">By status (window)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.entries(data.totals.byStatusInWindow).map(([s, n]) => (
              <li key={s} className="flex justify-between gap-2">
                <span className="text-[var(--muted-foreground)]">{statusLabels[s] ?? s}</span>
                <span className="tabular-nums font-medium text-[var(--foreground)]">{n}</span>
              </li>
            ))}
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
