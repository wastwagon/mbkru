import { NextResponse } from "next/server";

import { healthHttpStatus } from "@/lib/health-status-from-deps";
import { getHealthStatus } from "@/lib/server/health-status";

/** Liveness / readiness for Coolify and reverse proxies (Postgres + optional Redis probes). */
export async function GET() {
  const body = await getHealthStatus();
  const httpStatus = healthHttpStatus(body.status);
  return NextResponse.json(body, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
