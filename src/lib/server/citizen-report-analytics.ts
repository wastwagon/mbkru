import "server-only";

import { prisma } from "@/lib/db/prisma";

export type CitizenReportAnalytics = {
  generatedAt: string;
  windowMonths: number;
  windowSince: string;
  totals: {
    all: number;
    inWindow: number;
    /** All-time counts by report kind. */
    byKind: Record<string, number>;
    /** All-time counts by workflow status. */
    byStatus: Record<string, number>;
    /** Rolling window counts by kind (matches monthly chart window). */
    byKindInWindow: Record<string, number>;
    byStatusInWindow: Record<string, number>;
    withAttachments: number;
    slaOpenOverdue: number;
  };
  byRegion: Array<{ regionId: string; regionSlug: string; regionName: string; count: number }>;
  byMonth: Array<{ yearMonth: string; count: number }>;
};

const MAX_MONTHS = 36;

function clampMonths(raw: number | undefined): number {
  if (raw === undefined || !Number.isFinite(raw)) return 12;
  const n = Math.floor(raw);
  if (n < 1) return 1;
  if (n > MAX_MONTHS) return MAX_MONTHS;
  return n;
}

/** Aggregate, non-identifying stats for dashboards and annual reporting. */
export async function getCitizenReportAnalytics(monthsParam?: number): Promise<CitizenReportAnalytics> {
  const windowMonths = clampMonths(monthsParam);
  const since = new Date();
  since.setUTCMonth(since.getUTCMonth() - windowMonths);
  since.setUTCDate(1);
  since.setUTCHours(0, 0, 0, 0);

  const [
    totalAll,
    totalInWindow,
    kindGroups,
    statusGroups,
    kindGroupsWindow,
    statusGroupsWindow,
    withAttachments,
    slaOpenOverdue,
    regionGroups,
    monthRows,
  ] = await Promise.all([
    prisma.citizenReport.count(),
    prisma.citizenReport.count({ where: { createdAt: { gte: since } } }),
    prisma.citizenReport.groupBy({
      by: ["kind"],
      _count: { _all: true },
    }),
    prisma.citizenReport.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.citizenReport.groupBy({
      by: ["kind"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.citizenReport.groupBy({
      by: ["status"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.citizenReport.count({
      where: { attachments: { some: {} } },
    }),
    prisma.citizenReport.count({
      where: {
        slaDueAt: { lt: new Date() },
        status: { in: ["RECEIVED", "UNDER_REVIEW"] },
      },
    }),
    prisma.citizenReport.groupBy({
      by: ["regionId"],
      where: { regionId: { not: null } },
      _count: { _all: true },
    }),
    prisma.$queryRaw<Array<{ month: Date; c: bigint }>>`
      SELECT date_trunc('month', "createdAt") AS month, COUNT(*)::bigint AS c
      FROM "CitizenReport"
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  ]);

  const byKind: Record<string, number> = {};
  for (const row of kindGroups) {
    byKind[row.kind] = row._count._all;
  }
  const byStatus: Record<string, number> = {};
  for (const row of statusGroups) {
    byStatus[row.status] = row._count._all;
  }
  const byKindInWindow: Record<string, number> = {};
  for (const row of kindGroupsWindow) {
    byKindInWindow[row.kind] = row._count._all;
  }
  const byStatusInWindow: Record<string, number> = {};
  for (const row of statusGroupsWindow) {
    byStatusInWindow[row.status] = row._count._all;
  }

  const regionIds = regionGroups
    .map((r) => r.regionId)
    .filter((id): id is string => id !== null);
  const regions =
    regionIds.length > 0
      ? await prisma.region.findMany({
          where: { id: { in: regionIds } },
          select: { id: true, name: true, slug: true },
        })
      : [];
  const regionMeta = new Map(regions.map((r) => [r.id, r]));

  const byRegion = regionGroups
    .filter((r): r is typeof r & { regionId: string } => r.regionId !== null)
    .map((r) => {
      const meta = regionMeta.get(r.regionId);
      return {
        regionId: r.regionId,
        regionSlug: meta?.slug ?? "",
        regionName: meta?.name ?? "Unknown region",
        count: r._count._all,
      };
    })
    .sort((a, b) => b.count - a.count);

  const byMonth = monthRows.map((row) => {
    const d = row.month;
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return { yearMonth: `${y}-${m}`, count: Number(row.c) };
  });

  return {
    generatedAt: new Date().toISOString(),
    windowMonths,
    windowSince: since.toISOString(),
    totals: {
      all: totalAll,
      inWindow: totalInWindow,
      byKind,
      byStatus,
      byKindInWindow,
      byStatusInWindow,
      withAttachments,
      slaOpenOverdue,
    },
    byRegion,
    byMonth,
  };
}
