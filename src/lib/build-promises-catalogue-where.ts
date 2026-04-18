import type { Prisma, PromiseStatus } from "@prisma/client";

import {
  campaignPromiseMemberWhere,
  governmentProgrammeCatalogueWhere,
  promiseTextSearchWhere,
} from "@/lib/promise-catalogue-where";
import type { PromisesApiFilters } from "@/lib/promises-api-filters";

/** Same `where` as public catalogue rows (`/api/promises`, CSV, HTML browse). */
export function buildPromisesCatalogueWhere(filters: PromisesApiFilters): Prisma.CampaignPromiseWhereInput {
  const q = filters.q.trim();
  const clauses: Prisma.CampaignPromiseWhereInput[] = [];

  const cSlug = filters.constituencySlug || undefined;
  const mSlug = filters.memberSlug || undefined;

  if (filters.governmentOnly) {
    clauses.push(governmentProgrammeCatalogueWhere(mSlug, cSlug));
  } else {
    clauses.push({ memberId: { not: null } });
    clauses.push({ member: { is: campaignPromiseMemberWhere(mSlug, cSlug) } });
  }

  if (q) {
    clauses.push(promiseTextSearchWhere(q));
  }

  const where: Prisma.CampaignPromiseWhereInput = { AND: clauses };
  if (filters.partySlug) where.partySlug = filters.partySlug;
  if (filters.electionCycle) where.electionCycle = filters.electionCycle;
  if (filters.policySector) where.policySector = filters.policySector;
  if (filters.status) where.status = filters.status as PromiseStatus;
  return where;
}
