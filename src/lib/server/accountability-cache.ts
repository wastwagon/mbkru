import "server-only";

import { unstable_cache } from "next/cache";

import { ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC } from "@/lib/accountability-http";
import { buildPromisesCatalogueWhere } from "@/lib/build-promises-catalogue-where";
import type { PromisesApiFilters } from "@/lib/promises-api-filters";
import type { TrackerConstituencyOption } from "@/lib/tracker-constituency-public-types";
import {
  MPS_ROSTER_TAG,
  PROMISES_INDEX_TAG,
  REPORT_CARD_INDEX_TAG,
  promisesMemberTag,
  reportCardYearTag,
} from "@/lib/accountability-tags";
import { prisma } from "@/lib/db/prisma";
import { getPromiseTrackerStats } from "@/lib/server/promise-tracker-stats";

export {
  ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC,
  accountabilityApiNotFoundCacheControl,
  accountabilityPublicCacheControl,
} from "@/lib/accountability-http";

export {
  MPS_ROSTER_TAG,
  PROMISES_INDEX_TAG,
  REPORT_CARD_INDEX_TAG,
  promisesMemberTag,
  reportCardYearTag,
} from "@/lib/accountability-tags";

export async function getCachedPromisesIndexMembers() {
  return unstable_cache(
    async () => {
      return prisma.parliamentMember.findMany({
        where: {
          active: true,
          promises: { some: {} },
        },
        orderBy: { name: "asc" },
        include: {
          _count: { select: { promises: true } },
          constituency: { select: { name: true } },
        },
      });
    },
    ["promises-index-v1"],
    { tags: [PROMISES_INDEX_TAG], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}

/** Active parliament members for `GET /api/mps` (includes zero-promise rows). */
export async function getCachedMpsPublicRoster() {
  return unstable_cache(
    async () => {
      const rows = await prisma.parliamentMember.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
        select: {
          slug: true,
          name: true,
          role: true,
          party: true,
          constituency: { select: { name: true } },
          _count: { select: { promises: true } },
        },
      });
      return rows.map((m) => ({
        slug: m.slug,
        name: m.name,
        role: m.role,
        party: m.party,
        constituencyName: m.constituency?.name ?? null,
        promiseCount: m._count.promises,
      }));
    },
    ["api-mps-v1"],
    { tags: [MPS_ROSTER_TAG], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}

export async function getCachedPromisesMemberPublic(slug: string) {
  return unstable_cache(
    async () => {
      const member = await prisma.parliamentMember.findFirst({
        where: { slug, active: true },
        include: {
          constituency: true,
          promises: {
            orderBy: { updatedAt: "desc" },
            include: {
              manifestoDocument: { select: { title: true, sourceUrl: true } },
            },
          },
        },
      });
      if (!member || member.promises.length === 0) return null;
      return member;
    },
    ["promises-member-v2", slug],
    { tags: [PROMISES_INDEX_TAG, promisesMemberTag(slug)], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}

export async function getCachedPublishedReportCardCycles() {
  return unstable_cache(
    async () => {
      return prisma.reportCardCycle.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { year: "desc" },
        include: { _count: { select: { entries: true } } },
      });
    },
    ["report-card-index-v1"],
    { tags: [REPORT_CARD_INDEX_TAG], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}

export async function getCachedPublishedReportCardYear(year: number) {
  return unstable_cache(
    async () => {
      return prisma.reportCardCycle.findFirst({
        where: { year, publishedAt: { not: null } },
        include: {
          entries: {
            orderBy: { member: { name: "asc" } },
            include: {
              member: {
                select: {
                  name: true,
                  slug: true,
                  role: true,
                  party: true,
                  _count: { select: { promises: true } },
                },
              },
            },
          },
        },
      });
    },
    ["report-card-year-v1", String(year)],
    { tags: [REPORT_CARD_INDEX_TAG, reportCardYearTag(year)], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}

export type { PromisesApiFilters } from "@/lib/promises-api-filters";

function serializePromisesApiFilters(f: PromisesApiFilters): string {
  return [
    f.memberSlug,
    f.constituencySlug,
    f.partySlug,
    f.electionCycle,
    f.governmentOnly ? "1" : "0",
    f.policySector,
    f.status,
    f.q,
  ].join("|");
}

async function loadPromisesApiRows(filters: PromisesApiFilters) {
  const memberSlug = filters.memberSlug;
  const items = await prisma.campaignPromise.findMany({
    where: buildPromisesCatalogueWhere(filters),
    take: memberSlug ? 100 : 75,
    orderBy: { updatedAt: "desc" },
    include: {
      member: {
        select: {
          name: true,
          slug: true,
          role: true,
          party: true,
          active: true,
          constituency: { select: { name: true, slug: true } },
        },
      },
      manifestoDocument: {
        select: { id: true, title: true, partySlug: true, electionCycle: true, sourceUrl: true },
      },
    },
  });

  return items.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    sourceLabel: p.sourceLabel,
    sourceUrl: p.sourceUrl,
    sourceDate: p.sourceDate?.toISOString() ?? null,
    verificationNotes: p.verificationNotes,
    status: p.status,
    updatedAt: p.updatedAt.toISOString(),
    electionCycle: p.electionCycle,
    partySlug: p.partySlug,
    manifestoDocumentId: p.manifestoDocumentId,
    manifestoPageRef: p.manifestoPageRef,
    isGovernmentProgramme: p.isGovernmentProgramme,
    policySector: p.policySector,
    manifesto: p.manifestoDocument
      ? {
          id: p.manifestoDocument.id,
          title: p.manifestoDocument.title,
          partySlug: p.manifestoDocument.partySlug,
          electionCycle: p.manifestoDocument.electionCycle,
          sourceUrl: p.manifestoDocument.sourceUrl,
        }
      : null,
    member: p.member
      ? {
          name: p.member.name,
          slug: p.member.slug,
          role: p.member.role,
          party: p.member.party,
          constituency: p.member.constituency
            ? { name: p.member.constituency.name, slug: p.member.constituency.slug }
            : null,
        }
      : null,
  }));
}

/** JSON-safe rows for GET /api/promises (serializable for cache). */
export async function getCachedPromisesApiRows(filters: PromisesApiFilters) {
  if (filters.q.trim()) {
    return loadPromisesApiRows(filters);
  }

  const key = serializePromisesApiFilters(filters);
  const memberSlug = filters.memberSlug;

  return unstable_cache(
    async () => loadPromisesApiRows(filters),
    ["api-promises-v6", key],
    {
      tags: memberSlug
        ? [PROMISES_INDEX_TAG, promisesMemberTag(memberSlug)]
        : [PROMISES_INDEX_TAG],
      revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC,
    },
  )();
}

/** Tracker KPI strip — same filter keying as {@link getCachedPromisesApiRows}. */
export async function getCachedPromiseTrackerStats(filters: PromisesApiFilters) {
  if (filters.q.trim()) {
    return getPromiseTrackerStats(filters);
  }

  const key = serializePromisesApiFilters(filters);
  const memberSlug = filters.memberSlug;

  return unstable_cache(
    async () => getPromiseTrackerStats(filters),
    ["promise-tracker-stats-v1", key],
    {
      tags: memberSlug
        ? [PROMISES_INDEX_TAG, promisesMemberTag(memberSlug)]
        : [PROMISES_INDEX_TAG],
      revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC,
    },
  )();
}

async function loadPromisesCsvRows(filters: PromisesApiFilters) {
  const items = await prisma.campaignPromise.findMany({
    where: buildPromisesCatalogueWhere(filters),
    orderBy: { updatedAt: "desc" },
    include: {
      member: {
        select: {
          name: true,
          slug: true,
          role: true,
          party: true,
          active: true,
          constituency: { select: { name: true, slug: true } },
        },
      },
      manifestoDocument: {
        select: { id: true, title: true, sourceUrl: true },
      },
    },
  });

  return items.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        sourceLabel: p.sourceLabel,
        sourceUrl: p.sourceUrl,
        sourceDate: p.sourceDate?.toISOString() ?? null,
        verificationNotes: p.verificationNotes,
        status: p.status,
        updatedAt: p.updatedAt.toISOString(),
        electionCycle: p.electionCycle,
        partySlug: p.partySlug,
        manifestoDocumentId: p.manifestoDocumentId,
        manifestoPageRef: p.manifestoPageRef,
        isGovernmentProgramme: p.isGovernmentProgramme,
        policySector: p.policySector,
        manifestoTitle: p.manifestoDocument?.title ?? null,
        manifestoSourceUrl: p.manifestoDocument?.sourceUrl ?? null,
        member: p.member
          ? {
              name: p.member.name,
              slug: p.member.slug,
              role: p.member.role,
              party: p.member.party,
              constituencyName: p.member.constituency?.name ?? null,
            }
          : null,
      }));
}

/** Full promise rows for CSV export (no row cap; same filters as JSON API). */
export async function getCachedPromisesExportCsvRows(filters: PromisesApiFilters) {
  if (filters.q.trim()) {
    return loadPromisesCsvRows(filters);
  }

  const key = serializePromisesApiFilters(filters);
  const memberSlug = filters.memberSlug;

  return unstable_cache(
    async () => loadPromisesCsvRows(filters),
    ["api-promises-csv-export-v6", key],
    {
      tags: memberSlug
        ? [PROMISES_INDEX_TAG, promisesMemberTag(memberSlug)]
        : [PROMISES_INDEX_TAG],
      revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC,
    },
  )();
}

export type { TrackerConstituencyOption } from "@/lib/tracker-constituency-public-types";

/** Constituencies + first active MP per seat — powers the public tracker dropdown (seeded JSON + roster). */
export async function getCachedTrackerConstituencies(): Promise<TrackerConstituencyOption[]> {
  return unstable_cache(
    async () => {
      const rows = await prisma.constituency.findMany({
        orderBy: [{ region: { name: "asc" } }, { name: "asc" }],
        select: {
          slug: true,
          name: true,
          region: { select: { name: true } },
          members: {
            where: { active: true },
            orderBy: { name: "asc" },
            take: 1,
            select: { name: true, slug: true },
          },
        },
      });
      return rows.map((r) => ({
        slug: r.slug,
        name: r.name,
        regionName: r.region.name,
        mp: r.members[0] ? { name: r.members[0].name, slug: r.members[0].slug } : null,
      }));
    },
    ["tracker-constituencies-v1"],
    { tags: [MPS_ROSTER_TAG, PROMISES_INDEX_TAG], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}

export async function getCachedReportCardApiPayload(year: number) {
  return unstable_cache(
    async () => {
      const cycle = await prisma.reportCardCycle.findFirst({
        where: { year, publishedAt: { not: null } },
        include: {
          entries: {
            orderBy: { member: { name: "asc" } },
            include: { member: { select: { name: true, slug: true, role: true, party: true } } },
          },
        },
      });
      if (!cycle) return null;
      return {
        year: cycle.year,
        label: cycle.label,
        publishedAt: cycle.publishedAt!.toISOString(),
        methodology: cycle.methodology,
        entries: cycle.entries.map((e) => ({
          member: {
            name: e.member.name,
            slug: e.member.slug,
            role: e.member.role,
            party: e.member.party,
          },
          narrative: e.narrative,
          overallScore: e.overallScore,
          metrics: e.metrics,
          updatedAt: e.updatedAt.toISOString(),
        })),
      };
    },
    ["api-report-card-v1", String(year)],
    { tags: [REPORT_CARD_INDEX_TAG, reportCardYearTag(year)], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}
