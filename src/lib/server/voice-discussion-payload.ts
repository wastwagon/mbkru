import "server-only";

import type { CommentReactionKind } from "@prisma/client";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import type { VoiceDiscussionPayload } from "@/lib/voice-discussion-types";
import { voiceDiscussionWhere } from "@/lib/server/voice-discussion-report";

export type { VoiceDiscussionPayload } from "@/lib/voice-discussion-types";

function tallyReactions(
  rows: { commentId: string; kind: CommentReactionKind }[],
): Map<string, { LIKE: number; THANK: number; INSIGHT: number }> {
  const m = new Map<string, { LIKE: number; THANK: number; INSIGHT: number }>();
  for (const r of rows) {
    const cur = m.get(r.commentId) ?? { LIKE: 0, THANK: 0, INSIGHT: 0 };
    cur[r.kind] += 1;
    m.set(r.commentId, cur);
  }
  return m;
}

export async function buildVoiceDiscussionPayload(reportId: string): Promise<VoiceDiscussionPayload | null> {
  if (!isDatabaseConfigured()) return null;

  const report = await prisma.citizenReport.findFirst({
    where: voiceDiscussionWhere(reportId),
    include: {
      region: { select: { name: true, slug: true } },
      parliamentMember: { select: { name: true, slug: true, role: true, party: true } },
      _count: { select: { publicCauseSupports: true } },
    },
  });

  if (!report) return null;

  const comments = await prisma.citizenReportPublicComment.findMany({
    where: { reportId: report.id, status: "VISIBLE" },
    orderBy: { createdAt: "asc" },
    take: 500,
    select: {
      id: true,
      body: true,
      parentCommentId: true,
      createdAt: true,
      member: { select: { displayName: true } },
    },
  });

  const commentIds = comments.map((c) => c.id);
  const session = await getMemberSession();

  const reactionRows =
    commentIds.length > 0
      ? await prisma.citizenReportCommentReaction.findMany({
          where: { commentId: { in: commentIds } },
          select: { commentId: true, kind: true, memberId: true },
        })
      : [];

  const byComment = tallyReactions(reactionRows.map((r) => ({ commentId: r.commentId, kind: r.kind })));
  const viewerByComment = new Map<string, CommentReactionKind>();
  if (session) {
    for (const r of reactionRows) {
      if (r.memberId === session.memberId) {
        viewerByComment.set(r.commentId, r.kind);
      }
    }
  }

  let viewerSupported = false;
  if (session) {
    const s = await prisma.citizenReportSupport.findUnique({
      where: { reportId_memberId: { reportId: report.id, memberId: session.memberId } },
      select: { reportId: true },
    });
    viewerSupported = Boolean(s);
  }

  return {
    id: report.id,
    title: report.title,
    body: report.body,
    kind: report.kind,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    sessionSignedIn: Boolean(session),
    regionName: report.region?.name ?? null,
    figure: report.parliamentMember
      ? {
          name: report.parliamentMember.name,
          slug: report.parliamentMember.slug,
          role: report.parliamentMember.role,
          party: report.parliamentMember.party,
        }
      : null,
    supportCount: report._count.publicCauseSupports,
    viewerSupported,
    comments: comments.map((c) => ({
      id: c.id,
      body: c.body,
      parentCommentId: c.parentCommentId,
      createdAt: c.createdAt.toISOString(),
      authorLabel: c.member.displayName?.trim() || "Member",
      reactions: byComment.get(c.id) ?? { LIKE: 0, THANK: 0, INSIGHT: 0 },
      viewerReaction: viewerByComment.get(c.id) ?? null,
    })),
  };
}
