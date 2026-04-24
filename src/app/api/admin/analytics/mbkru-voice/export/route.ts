import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  getMbkruVoiceAnalyticsSummary,
  mbkruVoiceAnalyticsSummaryToCsv,
  parseMbkruVoiceAnalyticsDaysParam,
} from "@/lib/server/mbkru-voice-analytics";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

const BOM = "\uFEFF";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await allowAdminSessionRequest(session.adminId, "analytics-mbkru-voice-export"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const url = new URL(request.url);
    const days = parseMbkruVoiceAnalyticsDaysParam(url.searchParams.get("days"));
    const summary = await getMbkruVoiceAnalyticsSummary(days);
    const csv = BOM + mbkruVoiceAnalyticsSummaryToCsv(summary);
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `mbkru-voice-analytics-${summary.windowDays}d-${stamp}.csv`;
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
