import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getPetitionPendingAnalytics } from "@/lib/server/petition-pending-analytics";

export default async function AdminPetitionPendingAnalyticsPage() {
  await requireAdminSession();

  if (!isDatabaseConfigured()) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <p className="text-sm text-[var(--muted-foreground)]">
          <Link href="/admin" className="text-[var(--primary)] hover:underline">
            ← Admin
          </Link>
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">
          Petition pending signatures
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Database is not configured.</p>
      </div>
    );
  }

  const data = await getPetitionPendingAnalytics();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className="text-[var(--primary)] hover:underline">
          ← Admin
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">
        Petition pending signatures
      </h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Guest email-verification queue (no addresses shown). Confirmed signatures live in{" "}
        <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">PetitionSignature</code>.
      </p>
      <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">Generated {data.generatedAt}</p>

      <p className="mt-2 text-sm">
        <Link href="/api/admin/analytics/petition-pending" className="text-[var(--primary)] hover:underline">
          JSON API
        </Link>{" "}
        <span className="text-[var(--muted-foreground)]">(same session cookie)</span>
        {" · "}
        <Link href="/admin/settings" className="text-[var(--primary)] hover:underline">
          Run expired-row cleanup
        </Link>
      </p>
      <p className="mt-2 max-w-2xl text-xs text-[var(--muted-foreground)]">
        JSON requests are rate-limited per admin (<code className="text-[11px]">RATE_LIMIT_*</code>). A{" "}
        <code className="text-[11px]">429</code> means wait briefly before refreshing or scripting this endpoint.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Active pending
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">
            {data.totals.activePending}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Link not yet expired</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Expired pending
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">
            {data.totals.expiredPending}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Safe to delete via cron</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Verified signatures
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">
            {data.totals.verifiedSignatures}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">All petitions, all time</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            New pending (30d)
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">
            {data.createdCounts.last30d}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Rows created in rolling window</p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          Pending rows created (rolling)
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Last 24h</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{data.createdCounts.last24h}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Last 7d</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{data.createdCounts.last7d}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Last 30d</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums">{data.createdCounts.last30d}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          By petition
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Petitions that currently have at least one pending row (active or expired).
        </p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 font-medium">Petition</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium tabular-nums">Active</th>
                <th className="px-4 py-3 text-right font-medium tabular-nums">Expired</th>
              </tr>
            </thead>
            <tbody>
              {data.byPetition.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-[var(--muted-foreground)]" colSpan={4}>
                    No pending signature rows.
                  </td>
                </tr>
              ) : (
                data.byPetition.map((row) => (
                  <tr key={row.petitionId} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/petitions/${row.slug}`}
                        className="font-medium text-[var(--primary)] hover:underline"
                      >
                        {row.title}
                      </Link>
                      <p className="mt-0.5 font-mono text-xs text-[var(--muted-foreground)]">{row.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">{row.petitionStatus}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.activePending}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.expiredPending}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
