import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTablePanel } from "@/components/admin/AdminTablePanel";
import { AdminTd } from "@/components/admin/AdminTd";
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
    by: ["parliamentMemberId", "experienceVerificationTier", "intakeSource"],
    where: { kind: "MP_PERFORMANCE", parliamentMemberId: { not: null } },
    _count: { _all: true },
  });

  const intakeTotals = await prisma.citizenReport.groupBy({
    by: ["intakeSource"],
    where: { kind: "MP_PERFORMANCE" },
    _count: { _all: true },
  });
  const councilTotal =
    intakeTotals.find((r) => r.intakeSource === "COUNCIL_EVALUATION")?._count._all ?? 0;
  const citizenTotal =
    intakeTotals.find((r) => r.intakeSource === "CITIZEN_VOICE")?._count._all ?? 0;

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
    council: number;
    citizen: number;
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
        council: 0,
        citizen: 0,
        byTier: { UNVERIFIED: 0, CORROBORATED: 0, DOCUMENTED: 0 },
      });
    }
    const row = accum.get(mpId)!;
    row.byTier[g.experienceVerificationTier] = g._count._all;
    row.total += g._count._all;
    if (g.intakeSource === "COUNCIL_EVALUATION") row.council += g._count._all;
    else row.citizen += g._count._all;
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
              {" · "}
              <Link href="/admin/reports?kind=MP_PERFORMANCE&intake=council" className={primaryLinkClass}>
                Council evaluations only
              </Link>
            </p>
          </>
        }
      />

      <dl className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-secondary)]">
            Citizen Voice MP
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-[var(--foreground)]">{citizenTotal}</dd>
        </div>
        <div className="rounded-xl border border-[var(--accent-gold)]/35 bg-[var(--accent-gold-light)]/20 px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-secondary)]">
            Council evaluation
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums text-[var(--foreground)]">{councilTotal}</dd>
        </div>
      </dl>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--foreground-secondary)]">No MP performance reports in the database yet.</p>
      ) : (
        <AdminTablePanel className="mt-8">
          <table className="admin-table-stack min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--section-light)]/60 text-xs uppercase tracking-wide text-[var(--foreground-secondary)]">
              <tr>
                <th className="px-4 py-3 font-semibold">MP</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Citizen</th>
                <th className="px-4 py-3 font-semibold">Council</th>
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
                  <AdminTd label="MP" className="px-4 py-3 sm:px-4 sm:py-3">
                    <Link href={`/admin/parliament/${r.mpId}`} className={primaryLinkClass}>
                      {r.name}
                    </Link>
                    <div className="font-mono text-[11px] text-[var(--foreground-secondary)]">{r.slug}</div>
                  </AdminTd>
                  <AdminTd label="Total" className="px-4 py-3 font-medium tabular-nums sm:px-4 sm:py-3">
                    {r.total}
                  </AdminTd>
                  <AdminTd label="Citizen" className="px-4 py-3 tabular-nums text-[var(--foreground-secondary)] sm:px-4 sm:py-3">
                    {r.citizen}
                  </AdminTd>
                  <AdminTd label="Council" className="px-4 py-3 tabular-nums text-[var(--foreground-secondary)] sm:px-4 sm:py-3">
                    {r.council}
                  </AdminTd>
                  {TIERS.map((t) => (
                    <AdminTd
                      key={t}
                      label={t.replace(/_/g, " ")}
                      className="px-4 py-3 tabular-nums text-[var(--foreground-secondary)] sm:px-4 sm:py-3"
                    >
                      {r.byTier[t]}
                    </AdminTd>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTablePanel>
      )}
    </AdminPageContainer>
  );
}
