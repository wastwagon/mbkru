import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { voiceDiscussionWhere } from "@/lib/server/voice-discussion-report";
import { voiceDiscussionSupportBodySchema } from "@/lib/validation/voice-discussion";

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

  if (!(await allowPublicFormRequest(request, "voice-discussion-support"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { reportId } = await params;
  if (!reportId?.trim()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    json = {};
  }
  const parsed = voiceDiscussionSupportBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const action = parsed.data.action;

  const report = await prisma.citizenReport.findFirst({
    where: voiceDiscussionWhere(reportId),
    select: { id: true },
  });

  if (!report) {
    return NextResponse.json({ error: "Discussion not available." }, { status: 400 });
  }

  if (action === "remove") {
    await prisma.citizenReportSupport.deleteMany({
      where: { reportId: report.id, memberId: session.memberId },
    });
  } else {
    await prisma.citizenReportSupport.upsert({
      where: {
        reportId_memberId: { reportId: report.id, memberId: session.memberId },
      },
      create: { reportId: report.id, memberId: session.memberId },
      update: {},
    });
  }

  const count = await prisma.citizenReportSupport.count({ where: { reportId: report.id } });
  return NextResponse.json({ ok: true, supportCount: count, supported: action !== "remove" });
}
