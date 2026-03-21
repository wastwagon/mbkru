import { NextResponse } from "next/server";

import { getHealthStatus } from "@/lib/server/health-status";

/**
 * Liveness for Coolify, reverse proxies, and monitoring.
 * Extend `getHealthStatus()` in Phase 2 with real DB/Redis checks.
 */
export async function GET() {
  const body = getHealthStatus();
  return NextResponse.json(body, {
    status: body.status === "ok" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
