import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  accountabilityApiNotFoundCacheControl,
  accountabilityPublicCacheControl,
  getCachedReportCardApiPayload,
} from "@/lib/server/accountability-cache";
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

  const payload = await getCachedReportCardApiPayload(year);

  if (!payload) {
    return NextResponse.json(
      { error: "Not found" },
      {
        status: 404,
        headers: { "Cache-Control": accountabilityApiNotFoundCacheControl() },
      },
    );
  }

  return NextResponse.json(payload, {
    headers: { "Cache-Control": accountabilityPublicCacheControl() },
  });
}
