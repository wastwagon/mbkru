import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";

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

  if (!(await allowPublicFormRequest(request, "public-causes-support"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    json = {};
  }
  const action =
    typeof json === "object" && json !== null && "action" in json && (json as { action?: string }).action === "remove"
      ? "remove"
      : "add";

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
