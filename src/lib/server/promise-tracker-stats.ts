import "server-only";

import type { Prisma } from "@prisma/client";

import { buildPromisesCatalogueWhere } from "@/lib/build-promises-catalogue-where";
import type { PromiseTrackerStats } from "@/lib/promise-tracker-public-types";
import { campaignPromiseMemberWhere } from "@/lib/promise-catalogue-where";
import type { PromisesApiFilters } from "@/lib/promises-api-filters";
import { prisma } from "@/lib/db/prisma";

export type { PromiseTrackerStats } from "@/lib/promise-tracker-public-types";

/**
 * Headline tracker counts aligned with the public commitment catalogue for the same
 * {@link PromisesApiFilters} (government vs browse via `governmentOnly`).
 */
export async function getPromiseTrackerStats(filters: PromisesApiFilters): Promise<PromiseTrackerStats> {
  const scope = filters.governmentOnly ? "government" : "all";
  const catalogueWhere = buildPromisesCatalogueWhere(filters);

  const memberSlug = filters.memberSlug.trim() || undefined;
  const constituencySlug = filters.constituencySlug.trim() || undefined;
  const rosterWhere = campaignPromiseMemberWhere(memberSlug, constituencySlug);

  const memberSliceFilters: PromisesApiFilters = { ...filters, governmentOnly: false };
  const memberCatalogueWhere = buildPromisesCatalogueWhere(memberSliceFilters);
  const governmentPromisesWhere: Prisma.CampaignPromiseWhereInput = {
    AND: [memberCatalogueWhere, { isGovernmentProgramme: true }],
  };

  const [totalPromises, governmentPromises, mpsWithPromises, activeMpsTotal, statusGroups, cycles, entryCount] =
    await Promise.all([
      prisma.campaignPromise.count({ where: catalogueWhere }),
      prisma.campaignPromise.count({ where: governmentPromisesWhere }),
      prisma.parliamentMember.count({
        where: {
          ...rosterWhere,
          promises: { some: catalogueWhere },
        },
      }),
      prisma.parliamentMember.count({ where: rosterWhere }),
      prisma.campaignPromise.groupBy({
        by: ["status"],
        where: catalogueWhere,
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
