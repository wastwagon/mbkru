import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { parsePromisesApiFilters } from "@/lib/promises-api-filters";
import { accountabilityPublicCacheControl, getCachedPromisesApiRows } from "@/lib/server/accountability-cache";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

/** Public read-only JSON for the tracked-commitments catalogue (Phase 2+ accountability pilot). */
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

  const filters = parsePromisesApiFilters(new URL(request.url));

  const body = await getCachedPromisesApiRows(filters);

  const cacheControl = filters.q.trim()
    ? "private, no-store, max-age=0"
    : accountabilityPublicCacheControl();

  return NextResponse.json(
    { promises: body },
    { headers: { "Cache-Control": cacheControl } },
  );
}
