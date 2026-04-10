import { NextResponse } from "next/server";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { slug: raw } = await params;
  const slug = raw.trim().toLowerCase();
  if (!slug) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const report = await prisma.citizenReport.findFirst({
    where: {
      publicCauseSlug: slug,
      publicCauseOpenedAt: { not: null },
    },
    include: {
      region: { select: { name: true, slug: true } },
      _count: { select: { publicCauseSupports: true } },
    },
  });

  if (!report?.publicCauseTitle || !report.publicCauseSummary) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comments = await prisma.citizenReportPublicComment.findMany({
    where: { reportId: report.id, status: "VISIBLE" },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      body: true,
      createdAt: true,
      member: { select: { displayName: true } },
    },
  });

  const session = await getMemberSession();
  let viewerSupported = false;
  if (session) {
    const s = await prisma.citizenReportSupport.findUnique({
      where: {
        reportId_memberId: { reportId: report.id, memberId: session.memberId },
      },
      select: { reportId: true },
    });
    viewerSupported = Boolean(s);
  }

  return NextResponse.json({
    cause: {
      slug: report.publicCauseSlug!,
      title: report.publicCauseTitle,
      summary: report.publicCauseSummary,
      openedAt: report.publicCauseOpenedAt!.toISOString(),
      closed: report.publicCauseClosed,
      kind: report.kind,
      regionName: report.region?.name ?? null,
      supportCount: report._count.publicCauseSupports,
      viewerSupported,
      comments: comments.map((c) => ({
        id: c.id,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
        authorLabel: c.member.displayName?.trim() || "Member",
      })),
    },
  });
}
