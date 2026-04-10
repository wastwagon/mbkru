import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";
import { publicCauseCommentBodySchema } from "@/lib/validation/civic-engagement";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Props) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) {
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

  if (!(await allowPublicFormRequest(request, "public-causes-comment"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = publicCauseCommentBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const report = await prisma.citizenReport.findFirst({
    where: {
      publicCauseSlug: slug,
      publicCauseOpenedAt: { not: null },
    },
    select: { id: true, publicCauseClosed: true },
  });

  if (!report || report.publicCauseClosed) {
    return NextResponse.json({ error: "This cause is closed or not published." }, { status: 400 });
  }

  const c = await prisma.citizenReportPublicComment.create({
    data: {
      reportId: report.id,
      memberId: session.memberId,
      body: parsed.data.body,
      status: "VISIBLE",
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      member: { select: { displayName: true } },
    },
  });

  return NextResponse.json({
    comment: {
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      authorLabel: c.member.displayName?.trim() || "Member",
    },
  });
}
