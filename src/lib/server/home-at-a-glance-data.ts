import "server-only";

import { Prisma } from "@prisma/client";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import type {
  HomeAtAGlanceData,
  HomeCommunityTeaser,
  HomePetitionTeaser,
  HomePublicCauseTeaser,
  HomeReportCardTeaser,
  HomeTownHallTeaser,
  HomeVoiceTeaser,
} from "@/lib/home-at-a-glance-types";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { programmeEventKindLabel } from "@/lib/programme-event-labels";
import {
  isCivicPetitionsAndPublicCausesEnabled,
  isCommunitiesBrowseEnabled,
  isPublicVoiceStatisticsEnabled,
  isReportCardPublicEnabled,
  isTownHallDirectoryPageEnabled,
} from "@/lib/reports/accountability-pages";
import { getCachedPublishedReportCardCycles } from "@/lib/server/accountability-cache";
import { getProgrammeTownHallEvents } from "@/lib/server/town-hall-events";

function empty(): HomeAtAGlanceData {
  return {
    petitions: null,
    publicCauses: null,
    communities: null,
    townHalls: null,
    reportCard: null,
    voiceTotals: null,
  };
}

function isRecoverableSchemaError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021";
}

async function loadPetitions(): Promise<HomePetitionTeaser[] | null> {
  try {
    const rows = await prisma.petition.findMany({
      where: { status: "OPEN" },
      orderBy: { signatures: { _count: "desc" } },
      take: 4,
      select: {
        slug: true,
        title: true,
        targetSignatures: true,
        _count: { select: { signatures: true } },
      },
    });
    return rows.map((p) => ({
      slug: p.slug,
      title: p.title,
      signatureCount: p._count.signatures,
      targetSignatures: p.targetSignatures,
    }));
  } catch (e) {
    if (isRecoverableSchemaError(e)) return null;
    console.error("[home-at-a-glance] petitions", e);
    return null;
  }
}

async function loadPublicCauses(): Promise<HomePublicCauseTeaser[] | null> {
  try {
    const rows = await prisma.citizenReport.findMany({
      where: {
        publicCauseOpenedAt: { not: null },
        publicCauseClosed: false,
        publicCauseSlug: { not: null },
        publicCauseTitle: { not: null },
        publicCauseSummary: { not: null },
      },
      orderBy: { publicCauseSupports: { _count: "desc" } },
      take: 4,
      select: {
        publicCauseSlug: true,
        publicCauseTitle: true,
        region: { select: { name: true } },
        _count: { select: { publicCauseSupports: true, publicCauseComments: true } },
      },
    });
    return rows
      .filter((r) => r.publicCauseSlug && r.publicCauseTitle)
      .map((r) => ({
        slug: r.publicCauseSlug!,
        title: r.publicCauseTitle!,
        supportCount: r._count.publicCauseSupports,
        commentCount: r._count.publicCauseComments,
        regionName: r.region?.name ?? null,
      }));
  } catch (e) {
    if (isRecoverableSchemaError(e)) return null;
    console.error("[home-at-a-glance] public causes", e);
    return null;
  }
}

async function loadCommunities(): Promise<HomeCommunityTeaser[] | null> {
  try {
    const rows = await prisma.community.findMany({
      where: { status: "ACTIVE", visibility: { in: ["PUBLIC", "MEMBERS_ONLY"] } },
      orderBy: { updatedAt: "desc" },
      take: 48,
      select: {
        slug: true,
        name: true,
        region: { select: { name: true } },
        memberships: {
          where: { state: "ACTIVE" },
          select: { id: true },
        },
      },
    });
    const mapped: HomeCommunityTeaser[] = rows
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        regionName: c.region?.name ?? null,
        memberCount: c.memberships.length,
      }))
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, 4);
    return mapped;
  } catch (e) {
    if (isRecoverableSchemaError(e)) return null;
    console.error("[home-at-a-glance] communities", e);
    return null;
  }
}

async function loadTownHalls(): Promise<HomeTownHallTeaser[] | null> {
  try {
    const events = await getProgrammeTownHallEvents();
    return events.slice(0, 5).map((ev) => ({
      slug: ev.slug,
      title: ev.title,
      kindLabel: programmeEventKindLabel(ev.kind),
      regionName: ev.region?.name ?? null,
      startsAt: ev.startsAt?.toISOString() ?? null,
      status: ev.status,
    }));
  } catch (e) {
    if (isRecoverableSchemaError(e)) return null;
    console.error("[home-at-a-glance] town halls", e);
    return null;
  }
}

async function loadReportCard(): Promise<HomeReportCardTeaser | null> {
  try {
    const cycles = await getCachedPublishedReportCardCycles();
    const latest = cycles[0];
    if (!latest) return null;
    return {
      year: latest.year,
      label: latest.label,
      entryCount: latest._count.entries,
    };
  } catch (e) {
    if (isRecoverableSchemaError(e)) return null;
    console.error("[home-at-a-glance] report card", e);
    return null;
  }
}

async function loadVoiceTotals(): Promise<HomeVoiceTeaser | null> {
  try {
    const totalReports = await prisma.citizenReport.count();
    return { totalReports };
  } catch (e) {
    if (isRecoverableSchemaError(e)) return null;
    console.error("[home-at-a-glance] voice totals", e);
    return null;
  }
}

/**
 * Parallel, feature-gated loaders — same sources as index pages where possible.
 * Returns null per slice when the feature is off, the DB is off, or the table is missing.
 */
export async function getHomeAtAGlanceData(): Promise<HomeAtAGlanceData> {
  if (!isDatabaseConfigured()) return empty();

  const phase = getServerPlatformPhase();
  const civic = isCivicPetitionsAndPublicCausesEnabled();
  const communitiesOn = isCommunitiesBrowseEnabled();
  const townsOn = isTownHallDirectoryPageEnabled();
  const reportOn = isReportCardPublicEnabled();
  const voiceAggOn = isPublicVoiceStatisticsEnabled() && platformFeatures.citizensVoicePlatform(phase);

  const [petitions, publicCauses, communities, townHalls, reportCard, voiceTotals] = await Promise.all([
    civic ? loadPetitions() : Promise.resolve(null),
    civic ? loadPublicCauses() : Promise.resolve(null),
    communitiesOn ? loadCommunities() : Promise.resolve(null),
    townsOn ? loadTownHalls() : Promise.resolve(null),
    reportOn ? loadReportCard() : Promise.resolve(null),
    voiceAggOn ? loadVoiceTotals() : Promise.resolve(null),
  ]);

  return {
    petitions,
    publicCauses,
    communities,
    townHalls,
    reportCard,
    voiceTotals,
  };
}
