import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export type PromiseTrackerStats = {
  scope: "all" | "government";
  totalPromises: number;
  governmentPromises: number;
  mpsWithPromises: number;
  activeMpsTotal: number;
  publishedReportCardCycles: number;
  reportCardEntriesPublished: number;
  byStatus: Partial<Record<string, number>>;
};

function baseMemberWhere(): Prisma.CampaignPromiseWhereInput {
  return {
    memberId: { not: null },
    member: { is: { active: true } },
  };
}

export async function getPromiseTrackerStats(scope: "all" | "government"): Promise<PromiseTrackerStats> {
  const memberOk = baseMemberWhere();
  const scopedWhere: Prisma.CampaignPromiseWhereInput =
    scope === "government" ? { ...memberOk, isGovernmentProgramme: true } : memberOk;

  const [totalPromises, governmentPromises, mpsWithPromises, activeMpsTotal, statusGroups, cycles, entryCount] =
    await Promise.all([
      prisma.campaignPromise.count({ where: scopedWhere }),
      prisma.campaignPromise.count({
        where: { ...memberOk, isGovernmentProgramme: true },
      }),
      prisma.parliamentMember.count({
        where: { active: true, promises: { some: { ...memberOk } } },
      }),
      prisma.parliamentMember.count({ where: { active: true } }),
      prisma.campaignPromise.groupBy({
        by: ["status"],
        where: scopedWhere,
        _count: { _all: true },
      }),
      prisma.reportCardCycle.count({ where: { publishedAt: { not: null } } }),
      prisma.scorecardEntry.count({
        where: { cycle: { publishedAt: { not: null } } },
      }),
    ]);

  const byStatus: Partial<Record<string, number>> = {};
  for (const row of statusGroups) {
    byStatus[row.status] = row._count._all;
  }

  return {
    scope,
    totalPromises,
    governmentPromises,
    mpsWithPromises,
    activeMpsTotal,
    publishedReportCardCycles: cycles,
    reportCardEntriesPublished: entryCount,
    byStatus,
  };
}
