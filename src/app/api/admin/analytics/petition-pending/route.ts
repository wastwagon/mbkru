import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getPetitionPendingAnalytics } from "@/lib/server/petition-pending-analytics";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

/** Pending guest-signature queue stats (no PII). Admin session required. */
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await allowAdminSessionRequest(session.adminId, "analytics-petition-pending-json"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const analytics = await getPetitionPendingAnalytics();
    return NextResponse.json(analytics, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
