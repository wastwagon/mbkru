import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  emptyVoiceDiscussionReactionTotals,
  type VoiceDiscussionReactionTotals,
  type VoiceSubmissionEngagementCounts,
} from "@/lib/voice-submission-display";

async function discussionReactionTotalsByReportIds(
  reportIds: string[],
): Promise<Map<string, VoiceDiscussionReactionTotals>> {
  const map = new Map<string, VoiceDiscussionReactionTotals>();
  for (const id of reportIds) map.set(id, emptyVoiceDiscussionReactionTotals());
  if (reportIds.length === 0) return map;

  const rows = await prisma.citizenReportPublicComment.findMany({
    where: { reportId: { in: reportIds }, status: "VISIBLE" },
    select: {
      reportId: true,
      reactions: { select: { kind: true } },
    },
  });

  for (const row of rows) {
    const totals = map.get(row.reportId);
    if (!totals) continue;
    for (const reaction of row.reactions) {
      if (reaction.kind === "LIKE") totals.LIKE += 1;
      else if (reaction.kind === "THANK") totals.THANK += 1;
      else if (reaction.kind === "INSIGHT") totals.INSIGHT += 1;
    }
  }

  return map;
}

/** Support, visible comment, and reaction totals for Voice browse / MP intake surfaces. */
export async function loadVoiceSubmissionEngagementByReportIds(
  reportIds: string[],
): Promise<Map<string, VoiceSubmissionEngagementCounts>> {
  const map = new Map<string, VoiceSubmissionEngagementCounts>();
  for (const id of reportIds) {
    map.set(id, {
      publicSupportCount: 0,
      publicCommentCount: 0,
      discussionReactionTotals: emptyVoiceDiscussionReactionTotals(),
    });
  }
  if (reportIds.length === 0) return map;

  const [counts, reactionMap] = await Promise.all([
    prisma.citizenReport.findMany({
      where: { id: { in: reportIds } },
      select: {
        id: true,
        _count: {
          select: {
            publicCauseSupports: true,
            publicCauseComments: { where: { status: "VISIBLE" } },
          },
        },
      },
    }),
    discussionReactionTotalsByReportIds(reportIds),
  ]);

  for (const row of counts) {
    map.set(row.id, {
      publicSupportCount: row._count.publicCauseSupports,
      publicCommentCount: row._count.publicCauseComments,
      discussionReactionTotals: reactionMap.get(row.id) ?? emptyVoiceDiscussionReactionTotals(),
    });
  }

  return map;
}
