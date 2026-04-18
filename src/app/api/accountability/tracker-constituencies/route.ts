import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  accountabilityPublicCacheControl,
  getCachedTrackerConstituencies,
} from "@/lib/server/accountability-cache";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

/** Constituency roster with optional active MP — for the public commitment tracker dropdown. */
export async function GET(request: Request) {
  if (!platformFeatures.parliamentTrackerData(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "tracker-constituencies-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const constituencies = await getCachedTrackerConstituencies();

  return NextResponse.json(
    { constituencies },
    { headers: { "Cache-Control": accountabilityPublicCacheControl() } },
  );
}
