import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

import type { CitizenReportExperienceVerificationTier } from "@prisma/client";

const TIERS: CitizenReportExperienceVerificationTier[] = ["UNVERIFIED", "CORROBORATED", "DOCUMENTED"];

export default async function AdminMpPerformanceSignalsPage() {
  await requireAdminSession();

  if (!isDatabaseConfigured()) {
    return (
      <AdminPageContainer>
        <AdminPageHeader title="MP performance signals" description="Database is not configured." />
      </AdminPageContainer>
    );
  }

  const grouped = await prisma.citizenReport.groupBy({
    by: ["parliamentMemberId", "experienceVerificationTier"],
    where: { kind: "MP_PERFORMANCE", parliamentMemberId: { not: null } },
    _count: { _all: true },
  });

  const mpIds = [...new Set(grouped.map((g) => g.parliamentMemberId).filter(Boolean))] as string[];
  const members =
    mpIds.length === 0
      ? []
      : await prisma.parliamentMember.findMany({
          where: { id: { in: mpIds } },
          select: { id: true, name: true, slug: true },
          orderBy: { name: "asc" },
        });
  const memberMap = new Map(members.map((m) => [m.id, m]));

  type Row = {
    mpId: string;
    name: string;
    slug: string;
    total: number;
    byTier: Record<CitizenReportExperienceVerificationTier, number>;
  };

  const accum = new Map<string, Row>();
  for (const g of grouped) {
    const mpId = g.parliamentMemberId as string;
    const name = memberMap.get(mpId)?.name ?? "(removed MP)";
    const slug = memberMap.get(mpId)?.slug ?? mpId;
    if (!accum.has(mpId)) {
      accum.set(mpId, {
        mpId,
        name,
        slug,
        total: 0,
        byTier: { UNVERIFIED: 0, CORROBORATED: 0, DOCUMENTED: 0 },
      });
    }
    const row = accum.get(mpId)!;
    row.byTier[g.experienceVerificationTier] = g._count._all;
    row.total += g._count._all;
  }

  const rows = [...accum.values()].sort((a, b) => b.total - a.total);

  return (
    <AdminPageContainer width="wide">
      <AdminPageHeader
        title="MP performance signals"
        description={
          <>
            <p>
              Aggregate counts of <strong>MP performance</strong> citizen reports by roster MP and staff verification tier
              (methodology evidence ladder). Not a statistical sample adjustment — triage view only.
            </p>
            <p className="mt-2 text-sm">
              <Link href="/admin/reports" className={primaryLinkClass}>
                ← Citizen reports queue
              </Link>
            </p>
          </>
        }
      />

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted-foreground)]">No MP performance reports in the database yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--border)] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--section-light)]/60 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 font-semibold">MP</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                {TIERS.map((t) => (
                  <th key={t} className="px-4 py-3 font-semibold">
                    {t.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.mpId} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/parliament/${r.mpId}`} className={primaryLinkClass}>
                      {r.name}
                    </Link>
                    <div className="font-mono text-[11px] text-[var(--muted-foreground)]">{r.slug}</div>
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium">{r.total}</td>
                  {TIERS.map((t) => (
                    <td key={t} className="px-4 py-3 tabular-nums text-[var(--muted-foreground)]">
                      {r.byTier[t]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPageContainer>
  );
}
