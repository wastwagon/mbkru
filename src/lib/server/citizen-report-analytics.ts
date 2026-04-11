import "server-only";

import {
  CITIZEN_REPORT_ANALYTICS_MAX_MONTHS,
  type CitizenReportAnalytics,
} from "@/lib/citizen-report-analytics-shared";
import { prisma } from "@/lib/db/prisma";

export type { CitizenReportAnalytics } from "@/lib/citizen-report-analytics-shared";
export {
  citizenReportAnalyticsToCsv,
  parseCitizenReportAnalyticsMonthsParam,
} from "@/lib/citizen-report-analytics-shared";

function clampMonths(raw: number | undefined): number {
  if (raw === undefined || !Number.isFinite(raw)) return 12;
  const n = Math.floor(raw);
  if (n < 1) return 1;
  if (n > CITIZEN_REPORT_ANALYTICS_MAX_MONTHS) return CITIZEN_REPORT_ANALYTICS_MAX_MONTHS;
  return n;
}

function sortPlaybookGroups(
  rows: Array<{ operationsPlaybookKey: string | null; _count: { _all: number } }>,
): Array<{ key: string; count: number }> {
  return rows
    .map((r) => ({
      key: r.operationsPlaybookKey ?? "",
      count: r._count._all,
    }))
    .sort((a, b) => b.count - a.count);
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
    playbookAll,
    playbookWindow,
    publicCauseWithThread,
    publicCauseThreadLive,
    publicCauseThreadClosed,
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
      by: ["operationsPlaybookKey"],
      _count: { _all: true },
    }),
    prisma.citizenReport.groupBy({
      by: ["operationsPlaybookKey"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.citizenReport.count({ where: { publicCauseSlug: { not: null } } }),
    prisma.citizenReport.count({
      where: { publicCauseSlug: { not: null }, publicCauseClosed: false },
    }),
    prisma.citizenReport.count({
      where: { publicCauseSlug: { not: null }, publicCauseClosed: true },
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
    byPlaybookAll: sortPlaybookGroups(playbookAll),
    byPlaybookInWindow: sortPlaybookGroups(playbookWindow),
    publicCauses: {
      withThread: publicCauseWithThread,
      threadLive: publicCauseThreadLive,
      threadClosed: publicCauseThreadClosed,
    },
    byRegion,
    byMonth,
  };
}
