import { NextResponse } from "next/server";

import {
  citizenReportAnalyticsToCsv,
  parseCitizenReportAnalyticsMonthsParam,
} from "@/lib/citizen-report-analytics-shared";
import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getCitizenReportAnalytics } from "@/lib/server/citizen-report-analytics";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

const BOM = "\uFEFF";

/** UTF-8 CSV of aggregate citizen-report stats (no PII). Admin session required. */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await allowAdminSessionRequest(session.adminId, "analytics-citizen-reports-export"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const months = parseCitizenReportAnalyticsMonthsParam(url.searchParams.get("months"));

  try {
    const analytics = await getCitizenReportAnalytics(months);
    const csv = BOM + citizenReportAnalyticsToCsv(analytics);
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `citizen-report-aggregates-${analytics.windowMonths}m-${stamp}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to build export" }, { status: 500 });
  }
}
