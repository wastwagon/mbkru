import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { accountabilityPublicCacheControl } from "@/lib/server/accountability-cache";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

/** Registered party manifesto documents (Phase 2+). */
export async function GET(request: Request) {
  if (!platformFeatures.manifestoRegistry(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "manifestos-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const rows = await prisma.manifestoDocument.findMany({
    orderBy: [{ electionCycle: "desc" }, { partySlug: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      partySlug: true,
      electionCycle: true,
      sourceUrl: true,
      publishedAt: true,
      notes: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(
    {
      manifestos: rows.map((m) => ({
        ...m,
        publishedAt: m.publishedAt?.toISOString() ?? null,
        updatedAt: m.updatedAt.toISOString(),
      })),
    },
    { headers: { "Cache-Control": accountabilityPublicCacheControl() } },
  );
}
