import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTablePanel } from "@/components/admin/AdminTablePanel";
import { AdminTd } from "@/components/admin/AdminTd";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { getPetitionPendingAnalytics } from "@/lib/server/petition-pending-analytics";

export default async function AdminPetitionPendingAnalyticsPage() {
  await requireAdminSession();

  if (!isDatabaseConfigured()) {
    return (
      <AdminPageContainer>
        <AdminPageHeader title="Petition pending signatures" description="Database is not configured." />
      </AdminPageContainer>
    );
  }

  const data = await getPetitionPendingAnalytics();

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Petition pending signatures"
        description={
          <>
            <p>
              Guest email-verification queue (no addresses shown). Confirmed signatures live in{" "}
              <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">PetitionSignature</code>.
            </p>
            <p className="mt-1 font-mono text-xs">Generated {data.generatedAt}</p>
          </>
        }
      />

      <p className="mt-2 text-sm">
        <Link href="/api/admin/analytics/petition-pending" className={primaryLinkClass}>
          JSON API
        </Link>{" "}
        <span className="text-[var(--foreground-secondary)]">(same session cookie)</span>
        {" · "}
        <Link href="/admin/settings" className={primaryLinkClass}>
          Run expired-row cleanup
        </Link>
      </p>
      <p className="mt-2 max-w-2xl text-xs text-[var(--foreground-secondary)]">
        JSON requests are rate-limited per admin (<code className="text-[11px]">RATE_LIMIT_*</code>). A{" "}
        <code className="text-[11px]">429</code> means wait briefly before refreshing or scripting this endpoint.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          surface="tile"
          valueSize="xl"
          label="Active pending"
          hint="Guest signature rows waiting for email confirmation (link still valid)."
          value={data.totals.activePending}
          subline="Link not yet expired"
        />
        <AdminMetricCard
          surface="tile"
          valueSize="xl"
          label="Expired pending"
          hint="Confirmation links past expiry — safe to purge from Settings cleanup."
          value={data.totals.expiredPending}
          delta={data.totals.expiredPending > 0 ? "Cleanup" : "Clear"}
          deltaTone={data.totals.expiredPending > 0 ? "warning" : "success"}
          subline="Safe to delete via cron"
        />
        <AdminMetricCard
          surface="tile"
          valueSize="xl"
          label="Verified signatures"
          hint="Confirmed PetitionSignature rows across all petitions."
          value={data.totals.verifiedSignatures}
          subline="All petitions, all time"
        />
        <AdminMetricCard
          surface="tile"
          valueSize="xl"
          label="New pending (30d)"
          hint="Pending rows created in the last 30 days (active or expired)."
          value={data.createdCounts.last30d}
          subline="Rows created in rolling window"
        />
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          Pending rows created (rolling)
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <AdminMetricCard
            surface="tile"
            valueSize="xl"
            label="Last 24h"
            hint="Guest pending signature rows created in the last 24 hours."
            value={data.createdCounts.last24h}
          />
          <AdminMetricCard
            surface="tile"
            valueSize="xl"
            label="Last 7d"
            hint="Guest pending signature rows created in the last 7 days."
            value={data.createdCounts.last7d}
          />
          <AdminMetricCard
            surface="tile"
            valueSize="xl"
            label="Last 30d"
            hint="Guest pending signature rows created in the last 30 days."
            value={data.createdCounts.last30d}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          By petition
        </h2>
        <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
          Petitions that currently have at least one pending row (active or expired).
        </p>
        <AdminTablePanel className="mt-4 shadow-sm">
          <table className="admin-table-stack min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wide text-[var(--foreground-secondary)]">
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
                  <td className="px-4 py-6" colSpan={4}>
                    <AdminEmptyState
                      title="No pending signature rows"
                      message="Guest email-verification queue is empty — verified signatures still appear in petition totals."
                      action={{ href: "/admin/petitions", label: "Open petitions" }}
                    />
                  </td>
                </tr>
              ) : (
                data.byPetition.map((row) => (
                  <tr key={row.petitionId} className="border-b border-[var(--border)] last:border-0">
                    <AdminTd label="Petition" className="px-4 py-3 sm:px-4 sm:py-3">
                      <Link href={`/petitions/${row.slug}`} className={primaryLinkClass}>
                        {row.title}
                      </Link>
                      <p className="mt-0.5 font-mono text-xs text-[var(--foreground-secondary)]">{row.slug}</p>
                    </AdminTd>
                    <AdminTd label="Status" className="px-4 py-3 text-[var(--foreground-secondary)] sm:px-4 sm:py-3">
                      {row.petitionStatus}
                    </AdminTd>
                    <AdminTd label="Active" className="px-4 py-3 text-right tabular-nums sm:px-4 sm:py-3 sm:text-right">
                      {row.activePending}
                    </AdminTd>
                    <AdminTd label="Expired" className="px-4 py-3 text-right tabular-nums sm:px-4 sm:py-3 sm:text-right">
                      {row.expiredPending}
                    </AdminTd>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </AdminTablePanel>
      </section>
    </AdminPageContainer>
  );
}
