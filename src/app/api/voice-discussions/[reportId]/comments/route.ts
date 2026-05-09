import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { createMemberNotification } from "@/lib/server/member-notifications";
import { voiceDiscussionWhere } from "@/lib/server/voice-discussion-report";
import { voiceDiscussionCommentBodySchema } from "@/lib/validation/voice-discussion";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ reportId: string }> };

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

  if (!(await allowPublicFormRequest(request, "voice-discussion-comment"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { reportId } = await params;
  if (!reportId?.trim()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = voiceDiscussionCommentBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const report = await prisma.citizenReport.findFirst({
    where: voiceDiscussionWhere(reportId),
    select: { id: true },
  });

  if (!report) {
    return NextResponse.json({ error: "Discussion not available." }, { status: 404 });
  }

  const parentId = parsed.data.parentCommentId ?? null;
  if (parentId) {
    const parent = await prisma.citizenReportPublicComment.findFirst({
      where: { id: parentId, reportId: report.id, status: "VISIBLE" },
      select: { parentCommentId: true },
    });
    if (!parent || parent.parentCommentId !== null) {
      return NextResponse.json({ error: "Invalid reply target." }, { status: 400 });
    }
  }

  const c = await prisma.citizenReportPublicComment.create({
    data: {
      reportId: report.id,
      memberId: session.memberId,
      body: parsed.data.body,
      status: "VISIBLE",
      parentCommentId: parentId,
    },
    select: {
      id: true,
      body: true,
      parentCommentId: true,
      createdAt: true,
      member: { select: { displayName: true } },
    },
  });

  const submitter = await prisma.citizenReport.findUnique({
    where: { id: report.id },
    select: { memberId: true, trackingCode: true, title: true },
  });
  if (
    submitter?.memberId &&
    submitter.memberId !== session.memberId
  ) {
    await createMemberNotification(submitter.memberId, "citizen_report_discussion_comment", {
      reportId: report.id,
      trackingCode: submitter.trackingCode,
      title: submitter.title.slice(0, 180),
    });
  }

  return NextResponse.json({
    comment: {
      id: c.id,
      body: c.body,
      parentCommentId: c.parentCommentId,
      createdAt: c.createdAt.toISOString(),
      authorLabel: c.member.displayName?.trim() || "Member",
      reactions: { LIKE: 0, THANK: 0, INSIGHT: 0 },
      viewerReaction: null as "LIKE" | "THANK" | "INSIGHT" | null,
    },
  });
}
