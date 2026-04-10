import { NextResponse } from "next/server";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const take = Math.min(40, Math.max(1, Number.parseInt(url.searchParams.get("take") ?? "20", 10) || 20));
  const skip = Math.max(0, Number.parseInt(url.searchParams.get("skip") ?? "0", 10) || 0);

  const where = {
    publicCauseOpenedAt: { not: null },
    publicCauseClosed: false,
    publicCauseSlug: { not: null },
  } as const;

  const [rows, total] = await Promise.all([
    prisma.citizenReport.findMany({
      where,
      orderBy: { publicCauseOpenedAt: "desc" },
      skip,
      take,
      select: {
        publicCauseSlug: true,
        publicCauseTitle: true,
        publicCauseSummary: true,
        publicCauseOpenedAt: true,
        kind: true,
        region: { select: { name: true } },
        _count: { select: { publicCauseSupports: true, publicCauseComments: true } },
      },
    }),
    prisma.citizenReport.count({ where }),
  ]);

  return NextResponse.json({
    causes: rows
      .filter((r) => r.publicCauseSlug && r.publicCauseTitle && r.publicCauseSummary)
      .map((r) => ({
        slug: r.publicCauseSlug!,
        title: r.publicCauseTitle!,
        summary: r.publicCauseSummary!,
        openedAt: r.publicCauseOpenedAt!.toISOString(),
        kind: r.kind,
        regionName: r.region?.name ?? null,
        supportCount: r._count.publicCauseSupports,
        commentCount: r._count.publicCauseComments,
      })),
    total,
  });
}
