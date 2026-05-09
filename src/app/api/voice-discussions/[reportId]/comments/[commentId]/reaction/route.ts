import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { createMemberNotification } from "@/lib/server/member-notifications";
import { voiceDiscussionWhere } from "@/lib/server/voice-discussion-report";
import { voiceDiscussionReactionBodySchema } from "@/lib/validation/voice-discussion";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ reportId: string; commentId: string }> };

export async function POST(request: Request, { params }: Props) {
  if (!isCitizensVoiceEnabled() || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;

  if (!platformFeatures.authentication(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!(await allowPublicFormRequest(request, "voice-discussion-reaction"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { reportId, commentId } = await params;
  if (!reportId?.trim() || !commentId?.trim()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = voiceDiscussionReactionBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const report = await prisma.citizenReport.findFirst({
    where: voiceDiscussionWhere(reportId),
    select: { id: true },
  });
  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comment = await prisma.citizenReportPublicComment.findFirst({
    where: { id: commentId, reportId: report.id, status: "VISIBLE" },
    select: {
      id: true,
      memberId: true,
      report: {
        select: { id: true, trackingCode: true, title: true },
      },
    },
  });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  const existingReaction = await prisma.citizenReportCommentReaction.findUnique({
    where: {
      commentId_memberId: { commentId: comment.id, memberId: session.memberId },
    },
    select: { kind: true },
  });

  const kind = parsed.data.kind;
  if (kind === null) {
    await prisma.citizenReportCommentReaction.deleteMany({
      where: { commentId: comment.id, memberId: session.memberId },
    });
  } else {
    await prisma.citizenReportCommentReaction.upsert({
      where: {
        commentId_memberId: { commentId: comment.id, memberId: session.memberId },
      },
      create: { commentId: comment.id, memberId: session.memberId, kind },
      update: { kind },
    });
  }

  const firstReactionFromViewer = kind !== null && !existingReaction;
  if (
    firstReactionFromViewer &&
    comment.memberId !== session.memberId
  ) {
    await createMemberNotification(comment.memberId, "citizen_report_discussion_reaction", {
      reportId: comment.report.id,
      trackingCode: comment.report.trackingCode,
      title: comment.report.title.slice(0, 180),
      reactionKind: kind,
    });
  }

  const tallies = await prisma.citizenReportCommentReaction.findMany({
    where: { commentId: comment.id },
    select: { kind: true },
  });
  const reactions = { LIKE: 0, THANK: 0, INSIGHT: 0 };
  for (const t of tallies) {
    reactions[t.kind] += 1;
  }

  return NextResponse.json({
    ok: true,
    viewerReaction: kind,
    reactions,
  });
}
