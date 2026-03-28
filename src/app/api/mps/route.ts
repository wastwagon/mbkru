import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  accountabilityPublicCacheControl,
  getCachedMpsPublicRoster,
} from "@/lib/server/accountability-cache";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

/** Active parliament / minister roster (Phase 2+ accountability pilot). */
export async function GET(request: Request) {
  if (!platformFeatures.parliamentTrackerData(getServerPlatformPhase())) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!(await allowPublicFormRequest(request, "mps-read"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const members = await getCachedMpsPublicRoster();

  return NextResponse.json(
    { members },
    { headers: { "Cache-Control": accountabilityPublicCacheControl() } },
  );
}
