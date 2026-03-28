import { NextResponse } from "next/server";

import { getHealthStatus } from "@/lib/server/health-status";

/** Liveness / readiness for Coolify and reverse proxies (Postgres + optional Redis probes). */
export async function GET() {
  const body = await getHealthStatus();
  const httpStatus = body.status === "unhealthy" ? 503 : 200;
  return NextResponse.json(body, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
