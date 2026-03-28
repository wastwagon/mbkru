import "server-only";

import { unstable_cache } from "next/cache";

import { ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC } from "@/lib/accountability-http";
import { prisma } from "@/lib/db/prisma";

export {
  ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC,
  accountabilityApiNotFoundCacheControl,
  accountabilityPublicCacheControl,
} from "@/lib/accountability-http";

/** Invalidate when any public “promises index” or API list (all) changes. */
export const PROMISES_INDEX_TAG = "mbkru:promises-index";

export function promisesMemberTag(slug: string): string {
  return `mbkru:promises-member:${slug}`;
}

export const REPORT_CARD_INDEX_TAG = "mbkru:report-card-index";

export function reportCardYearTag(year: number): string {
  return `mbkru:report-card-year:${year}`;
}

/** Invalidate when roster fields or promise counts in `GET /api/mps` should refresh. */
export const MPS_ROSTER_TAG = "mbkru:mps-roster";

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
          promises: { orderBy: { updatedAt: "desc" } },
        },
      });
      if (!member || member.promises.length === 0) return null;
      return member;
    },
    ["promises-member-v1", slug],
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

/** JSON-safe rows for GET /api/promises (serializable for cache). */
export async function getCachedPromisesApiRows(memberSlug: string) {
  return unstable_cache(
    async () => {
      const items = await prisma.campaignPromise.findMany({
        where: {
          memberId: { not: null },
          member: {
            is: {
              active: true,
              ...(memberSlug ? { slug: memberSlug } : {}),
            },
          },
        },
        take: memberSlug ? 100 : 50,
        orderBy: { updatedAt: "desc" },
        include: {
          member: {
            select: { name: true, slug: true, role: true, party: true, active: true },
          },
        },
      });

      return items.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        sourceLabel: p.sourceLabel,
        sourceDate: p.sourceDate?.toISOString() ?? null,
        status: p.status,
        updatedAt: p.updatedAt.toISOString(),
        member: p.member
          ? {
              name: p.member.name,
              slug: p.member.slug,
              role: p.member.role,
              party: p.member.party,
            }
          : null,
      }));
    },
    ["api-promises-v1", memberSlug || "__all__"],
    {
      tags: memberSlug
        ? [PROMISES_INDEX_TAG, promisesMemberTag(memberSlug)]
        : [PROMISES_INDEX_TAG],
      revalidate: ACCOUNTABILITY_PUBLIC_S_MAXAGE_SEC,
    },
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
