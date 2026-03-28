import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  accountabilityPublicCacheControl,
  getCachedPromisesApiRows,
} from "@/lib/server/accountability-cache";
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

  const body = await getCachedPromisesApiRows(memberSlug);

  return NextResponse.json(
    { promises: body },
    { headers: { "Cache-Control": accountabilityPublicCacheControl() } },
  );
}
