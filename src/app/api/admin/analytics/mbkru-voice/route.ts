import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getMbkruVoiceAnalyticsSummary, parseMbkruVoiceAnalyticsDaysParam } from "@/lib/server/mbkru-voice-analytics";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await allowAdminSessionRequest(session.adminId, "analytics-mbkru-voice-json"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const url = new URL(request.url);
    const days = parseMbkruVoiceAnalyticsDaysParam(url.searchParams.get("days"));
    const summary = await getMbkruVoiceAnalyticsSummary(days);
    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        ...summary,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
