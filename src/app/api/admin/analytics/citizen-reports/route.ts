import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getCitizenReportAnalytics } from "@/lib/server/citizen-report-analytics";

const MAX_MONTHS = 36;

function parseMonths(searchParams: URLSearchParams): number | undefined {
  const raw = searchParams.get("months");
  if (raw === null || raw === "") return undefined;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(MAX_MONTHS, Math.max(1, n));
}

/** Aggregate citizen report stats (no PII). Admin session required. */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const url = new URL(request.url);
  const months = parseMonths(url.searchParams);

  try {
    const analytics = await getCitizenReportAnalytics(months);
    return NextResponse.json(analytics, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
