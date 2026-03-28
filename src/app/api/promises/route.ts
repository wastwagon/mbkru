import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

/** Public read-only campaign promises (Phase 2+ accountability pilot). */
export async function GET(request: Request) {
  if (!platformFeatures.parliamentTrackerData(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "promises-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const memberSlug = searchParams.get("memberSlug")?.trim().toLowerCase() ?? "";

  const items = await prisma.campaignPromise.findMany({
    where: {
      memberId: { not: null },
      member: {
        is: {
          active: true,
          ...(memberSlug ? { slug: memberSlug } : {}),
        },
      },
    },
    take: memberSlug ? 100 : 50,
    orderBy: { updatedAt: "desc" },
    include: {
      member: {
        select: { name: true, slug: true, role: true, party: true, active: true },
      },
    },
  });

  const body = items.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      sourceLabel: p.sourceLabel,
      sourceDate: p.sourceDate?.toISOString() ?? null,
      status: p.status,
      updatedAt: p.updatedAt.toISOString(),
      member: p.member
        ? {
            name: p.member.name,
            slug: p.member.slug,
            role: p.member.role,
            party: p.member.party,
          }
        : null,
    }));

  return NextResponse.json({ promises: body });
}
