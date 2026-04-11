import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  getCitizenReportAnalytics,
  parseCitizenReportAnalyticsMonthsParam,
} from "@/lib/server/citizen-report-analytics";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

/** Aggregate citizen report stats (no PII). Admin session required. */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await allowAdminSessionRequest(session.adminId, "analytics-citizen-reports-json"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const months = parseCitizenReportAnalyticsMonthsParam(url.searchParams.get("months"));

  try {
    const analytics = await getCitizenReportAnalytics(months);
    return NextResponse.json(analytics, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
