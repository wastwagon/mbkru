import "server-only";

import { getServerPlatformPhase } from "@/config/platform";
import { getServerEnv, hasDatabaseUrl, hasRedisUrl } from "@/lib/env.server";

export type DependencyStatus = "not_configured" | "configured";

export interface HealthPayload {
  status: "ok" | "degraded";
  service: "mbkru-web";
  phase: number;
  timestamp: string;
  dependencies: {
    postgres: DependencyStatus;
    redis: DependencyStatus;
  };
  /** Phase 2+: add prisma.$queryRaw / ping here and set status to degraded on failure */
  notes?: string;
}

export function getHealthStatus(): HealthPayload {
  const phase = getServerPlatformPhase();
  getServerEnv();

  return {
    status: "ok",
    service: "mbkru-web",
    phase,
    timestamp: new Date().toISOString(),
    dependencies: {
      postgres: hasDatabaseUrl() ? "configured" : "not_configured",
      redis: hasRedisUrl() ? "configured" : "not_configured",
    },
    notes:
      phase === 1
        ? "Phase 1: Postgres/Redis optional. Wire Prisma/ioredis in Phase 2 for live checks."
        : undefined,
  };
}
