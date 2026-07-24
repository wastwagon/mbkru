import { NextResponse } from "next/server";

import {
  citizenReportAnalyticsToCsv,
  parseCitizenReportAnalyticsMonthsParam,
} from "@/lib/citizen-report-analytics-shared";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { isPublicVoiceStatisticsEnabled } from "@/lib/reports/accountability-pages";
import { getCitizenReportAnalytics } from "@/lib/server/citizen-report-analytics";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

const BOM = "\uFEFF";

/**
 * Public CSV of aggregate Voice / citizen-report statistics (no PII).
 * Same phase gate as `/transparency`; rate-limited per IP.
 */
export async function GET(request: Request) {
  if (!isPublicVoiceStatisticsEnabled()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  if (!(await allowPublicFormRequest(request, "citizen-report-analytics-export-csv"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const months = parseCitizenReportAnalyticsMonthsParam(url.searchParams.get("months"));

  try {
    const analytics = await getCitizenReportAnalytics(months);
    const csv = BOM + citizenReportAnalyticsToCsv(analytics);
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `mbkru-voice-aggregates-${analytics.windowMonths}m-${stamp}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to build export" }, { status: 500 });
  }
}
