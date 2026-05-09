import "server-only";

import type { CitizenReportKind, CitizenReportStatus, Prisma } from "@prisma/client";

/** Allowed filters on `/report-card` Voice submissions (matches enum subset). */
export const VOICE_SUBMISSION_KIND_FILTERS: readonly CitizenReportKind[] = [
  "VOICE",
  "MP_PERFORMANCE",
  "GOVERNMENT_PERFORMANCE",
  "SITUATIONAL_ALERT",
  "ELECTION_OBSERVATION",
] as const;
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { GHANA_ACCOUNTABILITY_PARLIAMENT_TERM } from "@/config/ghana-parliament-term";
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
import { getPromiseCatalogueApiFields } from "@/lib/promise-catalogue-display";
import { publicReportCardCycleTitle } from "@/lib/report-card-public-label";
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

/** React `cache` dedupes the same slug within one request (e.g. `generateMetadata` + page). */
export const getCachedPromisesMemberPublic = cache(async (slug: string) => {
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
});

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

/** Server-rendered report card year page — keep small to avoid gateway timeouts on large cycles (e.g. full-roster simulation). */
export const REPORT_CARD_PUBLIC_PAGE_SIZE = 40;

/** Published cycle header only (no entries). */
export async function getCachedPublishedReportCardCycleMeta(year: number) {
  return unstable_cache(
    async () => {
      return prisma.reportCardCycle.findFirst({
        where: { year, publishedAt: { not: null } },
        select: {
          id: true,
          year: true,
          label: true,
          methodology: true,
          publishedAt: true,
        },
      });
    },
    ["report-card-cycle-meta-v3", String(year)],
    { tags: [REPORT_CARD_INDEX_TAG, reportCardYearTag(year)], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}

export type ReportCardMpPickerOption = { slug: string; name: string };

/** MP slug/name list for the cycle filter dropdown (lightweight). */
export async function getCachedPublishedReportCardMpIndex(year: number): Promise<ReportCardMpPickerOption[]> {
  return unstable_cache(
    async () => {
      const cycle = await prisma.reportCardCycle.findFirst({
        where: { year, publishedAt: { not: null } },
        select: { id: true },
      });
      if (!cycle) return [];
      const rows = await prisma.scorecardEntry.findMany({
        where: { cycleId: cycle.id },
        select: { member: { select: { slug: true, name: true } } },
        orderBy: { member: { name: "asc" } },
      });
      return rows.map((r) => ({ slug: r.member.slug, name: r.member.name }));
    },
    ["report-card-mp-index-v3", String(year)],
    { tags: [REPORT_CARD_INDEX_TAG, reportCardYearTag(year)], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}

/** Aggregate stats + top MPs (does not load full entry rows). */
export async function getCachedPublishedReportCardYearStats(year: number) {
  return unstable_cache(
    async () => {
      const cycle = await prisma.reportCardCycle.findFirst({
        where: { year, publishedAt: { not: null } },
        select: { id: true },
      });
      if (!cycle) return null;
      const cycleId = cycle.id;
      const [totalEntries, scoredCount, avgRow, topRows] = await Promise.all([
        prisma.scorecardEntry.count({ where: { cycleId } }),
        prisma.scorecardEntry.count({ where: { cycleId, overallScore: { not: null } } }),
        prisma.scorecardEntry.aggregate({
          where: { cycleId, overallScore: { not: null } },
          _avg: { overallScore: true },
        }),
        prisma.scorecardEntry.findMany({
          where: { cycleId, overallScore: { not: null } },
          orderBy: { overallScore: "desc" },
          take: 3,
          select: {
            id: true,
            overallScore: true,
            member: { select: { slug: true, name: true } },
          },
        }),
      ]);
      return {
        totalEntries,
        scoredCount,
        avgScore: avgRow._avg.overallScore,
        topScored: topRows,
      };
    },
    ["report-card-year-stats-v3", String(year)],
    { tags: [REPORT_CARD_INDEX_TAG, reportCardYearTag(year)], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}

export type PublishedReportCardEntryRow = Prisma.ScorecardEntryGetPayload<{
  include: {
    member: {
      select: {
        name: true;
        slug: true;
        role: true;
        party: true;
        _count: { select: { promises: true } };
      };
    };
  };
}>;

/** One page of entries for SSR (metrics + narrative per row — cap page size). */
export async function getCachedPublishedReportCardEntriesPage(
  year: number,
  page: number,
  mpSlug: string | null,
): Promise<{ entries: PublishedReportCardEntryRow[]; totalFiltered: number; page: number }> {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const skip = (safePage - 1) * REPORT_CARD_PUBLIC_PAGE_SIZE;
  const trimmedMp = mpSlug?.trim() || null;
  const mpKey = trimmedMp ?? "all";

  return unstable_cache(
    async () => {
      const cycle = await prisma.reportCardCycle.findFirst({
        where: { year, publishedAt: { not: null } },
        select: { id: true },
      });
      if (!cycle) return { entries: [], totalFiltered: 0, page: safePage };

      const where = {
        cycleId: cycle.id,
        ...(trimmedMp ? { member: { slug: trimmedMp } } : {}),
      };

      const [entries, totalFiltered] = await Promise.all([
        prisma.scorecardEntry.findMany({
          where,
          orderBy: [
            { overallScore: { sort: "desc", nulls: "last" } },
            { member: { name: "asc" } },
          ],
          skip,
          take: REPORT_CARD_PUBLIC_PAGE_SIZE,
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
        }),
        prisma.scorecardEntry.count({ where }),
      ]);

      return { entries, totalFiltered, page: safePage };
    },
    ["report-card-entries-v3", String(year), String(safePage), mpKey],
    { tags: [REPORT_CARD_INDEX_TAG, reportCardYearTag(year)], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}

/** Index `/report-card` browse grid — paginated; no unstable_cache (filters vary). */
export const REPORT_CARD_INDEX_PAGE_SIZE = 24;

export type ReportCardBrowseRow = {
  id: string;
  overallScore: number | null;
  narrative: string | null;
  member: {
    name: string;
    slug: string;
    party: string | null;
    role: string;
    constituency: {
      name: string;
      region: { name: string; slug: string };
    } | null;
  };
};

export async function getReportCardBrowseEntries(opts: {
  year: number;
  page: number;
  regionId: string | null;
  q: string | null;
}): Promise<{ rows: ReportCardBrowseRow[]; totalFiltered: number; page: number }> {
  const safePage = Number.isFinite(opts.page) && opts.page >= 1 ? Math.floor(opts.page) : 1;
  const skip = (safePage - 1) * REPORT_CARD_INDEX_PAGE_SIZE;
  const q = opts.q?.trim() ?? "";
  const regionId = opts.regionId?.trim() || null;

  const cycle = await prisma.reportCardCycle.findFirst({
    where: { year: opts.year, publishedAt: { not: null } },
    select: { id: true },
  });
  if (!cycle) return { rows: [], totalFiltered: 0, page: safePage };

  const memberWhere: Prisma.ParliamentMemberWhereInput = {};
  if (q.length > 0) {
    memberWhere.name = { contains: q, mode: "insensitive" };
  }
  if (regionId) {
    memberWhere.constituency = { regionId };
  }

  const where: Prisma.ScorecardEntryWhereInput = {
    cycleId: cycle.id,
    ...(Object.keys(memberWhere).length > 0 ? { member: memberWhere } : {}),
  };

  const [raw, totalFiltered] = await Promise.all([
    prisma.scorecardEntry.findMany({
      where,
      orderBy: [
        { overallScore: { sort: "desc", nulls: "last" } },
        { member: { name: "asc" } },
      ],
      skip,
      take: REPORT_CARD_INDEX_PAGE_SIZE,
      select: {
        id: true,
        overallScore: true,
        narrative: true,
        member: {
          select: {
            name: true,
            slug: true,
            party: true,
            role: true,
            constituency: {
              select: {
                name: true,
                region: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    }),
    prisma.scorecardEntry.count({ where }),
  ]);

  const rows: ReportCardBrowseRow[] = raw.map((r) => ({
    id: r.id,
    overallScore: r.overallScore,
    narrative: r.narrative,
    member: {
      name: r.member.name,
      slug: r.member.slug,
      party: r.member.party,
      role: r.member.role,
      constituency: r.member.constituency
        ? {
            name: r.member.constituency.name,
            region: {
              name: r.member.constituency.region.name,
              slug: r.member.constituency.region.slug,
            },
          }
        : null,
    },
  }));

  return { rows, totalFiltered, page: safePage };
}

/** Index `/report-card` — MBKRU Voice submissions grid (paginated; filters vary — no unstable_cache). */
export const VOICE_SUBMISSIONS_BROWSE_PAGE_SIZE = 24;

export type VoiceSubmissionBrowseRow = {
  id: string;
  trackingCode: string;
  title: string;
  kind: CitizenReportKind;
  status: CitizenReportStatus;
  createdAt: Date;
  discussionEnabled: boolean;
  region: { name: string } | null;
  localArea: string | null;
  parliamentMember: { name: string; slug: string; role: string } | null;
  publicCauseSlug: string | null;
  publicCauseTitle: string | null;
  publicCauseSummary: string | null;
  publicSupportCount: number;
  publicCommentCount: number;
};

export async function getVoiceSubmissionsBrowseEntries(opts: {
  page: number;
  regionId: string | null;
  q: string | null;
  kind: CitizenReportKind | null;
}): Promise<{ rows: VoiceSubmissionBrowseRow[]; totalFiltered: number; page: number }> {
  const safePage = Number.isFinite(opts.page) && opts.page >= 1 ? Math.floor(opts.page) : 1;
  const skip = (safePage - 1) * VOICE_SUBMISSIONS_BROWSE_PAGE_SIZE;
  const q = opts.q?.trim() ?? "";
  const regionId = opts.regionId?.trim() || null;

  const where: Prisma.CitizenReportWhereInput = {
    status: { not: "ARCHIVED" },
  };
  if (regionId) where.regionId = regionId;
  if (opts.kind != null) where.kind = opts.kind;
  if (q.length > 0) {
    where.title = { contains: q, mode: "insensitive" };
  }

  const [raw, totalFiltered] = await Promise.all([
    prisma.citizenReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: VOICE_SUBMISSIONS_BROWSE_PAGE_SIZE,
      select: {
        id: true,
        trackingCode: true,
        title: true,
        kind: true,
        status: true,
        createdAt: true,
        discussionEnabled: true,
        localArea: true,
        region: { select: { name: true } },
        parliamentMember: { select: { name: true, slug: true, role: true } },
        publicCauseSlug: true,
        publicCauseTitle: true,
        publicCauseSummary: true,
        _count: {
          select: {
            publicCauseSupports: true,
            publicCauseComments: true,
          },
        },
      },
    }),
    prisma.citizenReport.count({ where }),
  ]);

  const rows: VoiceSubmissionBrowseRow[] = raw.map((r) => ({
    id: r.id,
    trackingCode: r.trackingCode,
    title: r.title,
    kind: r.kind,
    status: r.status,
    createdAt: r.createdAt,
    discussionEnabled: r.discussionEnabled,
    localArea: r.localArea,
    region: r.region,
    parliamentMember: r.parliamentMember,
    publicCauseSlug: r.publicCauseSlug,
    publicCauseTitle: r.publicCauseTitle,
    publicCauseSummary: r.publicCauseSummary,
    publicSupportCount: r._count.publicCauseSupports,
    publicCommentCount: r._count.publicCauseComments,
  }));

  return { rows, totalFiltered, page: safePage };
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

  return items.map((p) => {
    const cat = getPromiseCatalogueApiFields(p.verificationNotes);
    return {
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
    isManifestoCatalogueRow: cat.isManifestoCatalogueRow,
    catalogueThemeSlug: cat.catalogueThemeSlug,
    catalogueThemeLabel: cat.catalogueThemeLabel,
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
  };
  });
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
    ["api-promises-v8", key],
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

  return items.map((p) => {
    const cat = getPromiseCatalogueApiFields(p.verificationNotes);
    return {
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
        isManifestoCatalogueRow: cat.isManifestoCatalogueRow,
        catalogueThemeSlug: cat.catalogueThemeSlug,
        catalogueThemeLabel: cat.catalogueThemeLabel,
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
      };
  });
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
    ["api-promises-csv-export-v8", key],
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

export async function getCachedReportCardApiPayload(
  year: number,
  opts?: { page?: number; pageSize?: number },
) {
  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.min(250, Math.max(1, opts?.pageSize ?? 150));
  const skip = (page - 1) * pageSize;

  return unstable_cache(
    async () => {
      const cycle = await prisma.reportCardCycle.findFirst({
        where: { year, publishedAt: { not: null } },
        select: {
          year: true,
          label: true,
          methodology: true,
          publishedAt: true,
          id: true,
        },
      });
      if (!cycle) return null;

      const where = { cycleId: cycle.id };
      const [entryRows, totalEntries] = await Promise.all([
        prisma.scorecardEntry.findMany({
          where,
          orderBy: { member: { name: "asc" } },
          skip,
          take: pageSize,
          include: { member: { select: { name: true, slug: true, role: true, party: true } } },
        }),
        prisma.scorecardEntry.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));

      return {
        year: cycle.year,
        label: publicReportCardCycleTitle(cycle.year, cycle.label),
        parliamentTerm: {
          startYear: GHANA_ACCOUNTABILITY_PARLIAMENT_TERM.startYear,
          generalElectionYear: GHANA_ACCOUNTABILITY_PARLIAMENT_TERM.generalElectionYear,
        },
        publishedAt: cycle.publishedAt!.toISOString(),
        methodology: cycle.methodology,
        pagination: {
          page,
          pageSize,
          totalEntries,
          totalPages,
          sort: "memberNameAsc" as const,
        },
        entries: entryRows.map((e) => ({
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
    ["api-report-card-v4", String(year), String(page), String(pageSize)],
    { tags: [REPORT_CARD_INDEX_TAG, reportCardYearTag(year)], revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC },
  )();
}
