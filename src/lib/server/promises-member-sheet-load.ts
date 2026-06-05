import "server-only";

import { Prisma, type CitizenReportStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { loadVoiceSubmissionEngagementByReportIds } from "@/lib/server/voice-submission-engagement";
import {
  bodyPreviewLine,
  emptyVoiceDiscussionReactionTotals,
  type VoiceDiscussionReactionTotals,
  type VoiceSubmissionEngagementCounts,
} from "@/lib/voice-submission-display";

export type MpPerformanceIntakeRow = {
  id: string;
  title: string;
  trackingCode: string;
  createdAt: Date;
  discussionEnabled: boolean;
  status: CitizenReportStatus;
  bodyPreview: string | null;
  publicSupportCount: number;
  publicCommentCount: number;
  discussionReactionTotals: VoiceDiscussionReactionTotals;
};

function mapMpPerformanceIntakeRow(
  row: {
    id: string;
    title: string;
    trackingCode: string;
    createdAt: Date;
    body: string;
    status: CitizenReportStatus;
    discussionEnabled?: boolean;
  },
  engagement: VoiceSubmissionEngagementCounts,
): MpPerformanceIntakeRow {
  return {
    id: row.id,
    title: row.title,
    trackingCode: row.trackingCode,
    createdAt: row.createdAt,
    discussionEnabled: row.discussionEnabled ?? false,
    status: row.status,
    bodyPreview: bodyPreviewLine(row.body),
    publicSupportCount: engagement.publicSupportCount,
    publicCommentCount: engagement.publicCommentCount,
    discussionReactionTotals: engagement.discussionReactionTotals,
  };
}

async function attachMpPerformanceEngagement(
  rows: Array<{
    id: string;
    title: string;
    trackingCode: string;
    createdAt: Date;
    body: string;
    status: CitizenReportStatus;
    discussionEnabled?: boolean;
  }>,
): Promise<MpPerformanceIntakeRow[]> {
  const engagementMap = await loadVoiceSubmissionEngagementByReportIds(rows.map((r) => r.id));
  return rows.map((row) =>
    mapMpPerformanceIntakeRow(
      row,
      engagementMap.get(row.id) ?? {
        publicSupportCount: 0,
        publicCommentCount: 0,
        discussionReactionTotals: emptyVoiceDiscussionReactionTotals(),
      },
    ),
  );
}

export type PromisesMemberSheet = Awaited<ReturnType<typeof loadPromisesMemberSheetPublic>>;

function revivePromisesMemberSheet(member: NonNullable<PromisesMemberSheet>): NonNullable<PromisesMemberSheet> {
  return {
    ...member,
    promises: member.promises.map((p) => ({
      ...p,
      sourceDate: p.sourceDate != null ? new Date(p.sourceDate as Date | string) : null,
      updatedAt: new Date(p.updatedAt as Date | string),
    })),
  };
}

export function normalizePromisesMemberSheet(member: PromisesMemberSheet): PromisesMemberSheet {
  if (!member) return member;
  return revivePromisesMemberSheet(member);
}

function isMissingColumnError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2022") return true;
  const msg = e instanceof Error ? e.message : String(e);
  return /column .* does not exist/i.test(msg);
}

function promiseSelect(withBlockedReason: boolean) {
  return {
    id: true,
    title: true,
    description: true,
    sourceLabel: true,
    sourceUrl: true,
    sourceDate: true,
    verificationNotes: true,
    status: true,
    manifestoPageRef: true,
    electionCycle: true,
    partySlug: true,
    policySector: true,
    updatedAt: true,
    ...(withBlockedReason ? { blockedReason: true } : {}),
    manifestoDocument: { select: { title: true, sourceUrl: true } },
  } as const;
}

/** Public MP commitment sheet — tolerates older DBs missing newer optional columns. */
export async function loadPromisesMemberSheetPublic(slug: string) {
  const where = { slug, active: true as const };
  const memberSelect = {
    id: true,
    name: true,
    slug: true,
    role: true,
    party: true,
    constituency: true,
  } as const;

  for (const withBlockedReason of [true, false]) {
    try {
      return await prisma.parliamentMember.findFirst({
        where,
        select: {
          ...memberSelect,
          promises: {
            orderBy: { updatedAt: "desc" },
            select: promiseSelect(withBlockedReason),
          },
        },
      });
    } catch (e) {
      if (withBlockedReason && isMissingColumnError(e)) {
        console.warn(
          `[promises-member-sheet] blockedReason column unavailable for slug=${slug}; loading without it`,
        );
        continue;
      }
      console.error("[promises-member-sheet] member sheet query failed:", e);
      break;
    }
  }

  try {
    const member = await prisma.parliamentMember.findFirst({
      where,
      select: memberSelect,
    });
    if (!member) return null;
    console.warn(`[promises-member-sheet] returning member shell without catalogue rows for slug=${slug}`);
    return { ...member, promises: [] };
  } catch (e) {
    console.error("[promises-member-sheet] member shell query failed:", e);
    throw e;
  }
}

/** Recent MP performance Voice intakes for a roster member — optional section; never breaks the sheet. */
export async function loadMpPerformanceIntakes(memberId: string): Promise<MpPerformanceIntakeRow[]> {
  const where = {
    parliamentMemberId: memberId,
    kind: "MP_PERFORMANCE" as const,
    status: { not: "ARCHIVED" as const },
  };
  const baseArgs = {
    where,
    orderBy: { createdAt: "desc" as const },
    take: 12,
  };

  try {
    const rows = await prisma.citizenReport.findMany({
      ...baseArgs,
      select: {
        id: true,
        title: true,
        trackingCode: true,
        createdAt: true,
        body: true,
        status: true,
        discussionEnabled: true,
      },
    });
    return attachMpPerformanceEngagement(rows);
  } catch (e) {
    if (isMissingColumnError(e)) {
      try {
        const rows = await prisma.citizenReport.findMany({
          ...baseArgs,
          select: {
            id: true,
            title: true,
            trackingCode: true,
            createdAt: true,
            body: true,
            status: true,
          },
        });
        return attachMpPerformanceEngagement(rows.map((r) => ({ ...r, discussionEnabled: false })));
      } catch (fallbackError) {
        console.error("[promises-member-sheet] MP performance intakes fallback failed:", fallbackError);
        return [];
      }
    }
    console.error("[promises-member-sheet] MP performance intakes query failed:", e);
    return [];
  }
}

export type RecentMpPerformanceIntakeRow = MpPerformanceIntakeRow & {
  parliamentMember: { name: string; slug: string } | null;
};

/** Cross-MP feed for parliament tracker — same row shape as MP sheet intakes. */
export async function loadRecentMpPerformanceIntakes(take = 12): Promise<RecentMpPerformanceIntakeRow[]> {
  const baseArgs = {
    where: {
      kind: "MP_PERFORMANCE" as const,
      parliamentMemberId: { not: null },
      status: { not: "ARCHIVED" as const },
    },
    orderBy: { createdAt: "desc" as const },
    take,
  };

  try {
    const rows = await prisma.citizenReport.findMany({
      ...baseArgs,
      select: {
        id: true,
        title: true,
        trackingCode: true,
        createdAt: true,
        body: true,
        status: true,
        discussionEnabled: true,
        parliamentMember: { select: { name: true, slug: true } },
      },
    });
    const intakes = await attachMpPerformanceEngagement(rows);
    return intakes.map((report, index) => ({
      ...report,
      parliamentMember: rows[index]?.parliamentMember ?? null,
    }));
  } catch (e) {
    if (isMissingColumnError(e)) {
      try {
        const rows = await prisma.citizenReport.findMany({
          ...baseArgs,
          select: {
            id: true,
            title: true,
            trackingCode: true,
            createdAt: true,
            body: true,
            status: true,
            parliamentMember: { select: { name: true, slug: true } },
          },
        });
        const intakes = await attachMpPerformanceEngagement(rows.map((r) => ({ ...r, discussionEnabled: false })));
        return intakes.map((report, index) => ({
          ...report,
          parliamentMember: rows[index]?.parliamentMember ?? null,
        }));
      } catch (fallbackError) {
        console.error("[promises-member-sheet] recent MP performance intakes fallback failed:", fallbackError);
        return [];
      }
    }
    console.error("[promises-member-sheet] recent MP performance intakes query failed:", e);
    return [];
  }
}
