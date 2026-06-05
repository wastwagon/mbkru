import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export type MpPerformanceIntakeRow = {
  id: string;
  title: string;
  trackingCode: string;
  createdAt: Date;
  discussionEnabled: boolean;
};

export type PromisesMemberSheet = Awaited<ReturnType<typeof loadPromisesMemberSheetPublic>>;

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
    return await prisma.citizenReport.findMany({
      ...baseArgs,
      select: {
        id: true,
        title: true,
        trackingCode: true,
        createdAt: true,
        discussionEnabled: true,
      },
    });
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
          },
        });
        return rows.map((r) => ({ ...r, discussionEnabled: false }));
      } catch (fallbackError) {
        console.error("[promises-member-sheet] MP performance intakes fallback failed:", fallbackError);
        return [];
      }
    }
    console.error("[promises-member-sheet] MP performance intakes query failed:", e);
    return [];
  }
}
