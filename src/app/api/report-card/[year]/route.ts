import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

type Props = { params: Promise<{ year: string }> };

/** Published cycle JSON for partners / embeds (Phase 3). */
export async function GET(request: Request, { params }: Props) {
  if (!platformFeatures.accountabilityScorecards(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "report-card-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { year: raw } = await params;
  const year = Number.parseInt(raw, 10);
  if (!Number.isFinite(year) || year < 1992 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const cycle = await prisma.reportCardCycle.findFirst({
    where: { year, publishedAt: { not: null } },
    include: {
      entries: {
        orderBy: { member: { name: "asc" } },
        include: { member: { select: { name: true, slug: true, role: true, party: true } } },
      },
    },
  });

  if (!cycle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    year: cycle.year,
    label: cycle.label,
    publishedAt: cycle.publishedAt!.toISOString(),
    methodology: cycle.methodology,
    entries: cycle.entries.map((e) => ({
      member: {
        name: e.member.name,
        slug: e.member.slug,
        role: e.member.role,
        party: e.member.party,
      },
      narrative: e.narrative,
      overallScore: e.overallScore,
      metrics: e.metrics,
      updatedAt: e.updatedAt.toISOString(),
    })),
  });
}
