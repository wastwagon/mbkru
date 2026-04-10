import { NextResponse } from "next/server";

import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { citizensVoiceDisabledResponse, isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";

export async function GET() {
  if (!isCitizensVoiceEnabled()) return citizensVoiceDisabledResponse();

  const authBlock = guardMemberAuthApi();
  if (authBlock) return authBlock;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const reports = await prisma.citizenReport.findMany({
    where: { memberId: session.memberId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      trackingCode: true,
      kind: true,
      status: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          adminReplies: {
            where: { visibleToSubmitter: true },
          },
        },
      },
      adminReplies: {
        where: { visibleToSubmitter: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  return NextResponse.json({
    reports: reports.map((r) => ({
      id: r.id,
      trackingCode: r.trackingCode,
      kind: r.kind,
      status: r.status,
      title: r.title,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      adminReplyCount: r._count.adminReplies,
      lastVisibleTeamNoteAt: r.adminReplies[0]?.createdAt.toISOString() ?? null,
    })),
  });
}
