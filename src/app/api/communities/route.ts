import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { accountabilityPublicCacheControl } from "@/lib/server/accountability-cache";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

/** Public directory: active communities with PUBLIC visibility. */
export async function GET(request: Request) {
  if (!platformFeatures.communities(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "communities-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const rows = await prisma.community.findMany({
    where: { status: "ACTIVE", visibility: { in: ["PUBLIC", "MEMBERS_ONLY"] } },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      description: true,
      traditionalAreaName: true,
      joinPolicy: true,
      visibility: true,
      region: { select: { name: true, slug: true } },
      _count: { select: { memberships: true } },
    },
  });

  return NextResponse.json(
    {
      communities: rows.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.visibility === "MEMBERS_ONLY" ? null : c.description,
        traditionalAreaName: c.traditionalAreaName,
        joinPolicy: c.joinPolicy,
        visibility: c.visibility,
        region: c.region ? { name: c.region.name, slug: c.region.slug } : null,
        memberCount: c._count.memberships,
      })),
    },
    { headers: { "Cache-Control": accountabilityPublicCacheControl() } },
  );
}
