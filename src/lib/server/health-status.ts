import "server-only";

import Redis from "ioredis";

import { getServerPlatformPhase } from "@/config/platform";
import { getServerEnv, hasDatabaseUrl, hasRedisUrl } from "@/lib/env.server";

export type DependencyProbe = "not_configured" | "ok" | "error";

export interface HealthPayload {
  status: "ok" | "degraded" | "unhealthy";
  service: "mbkru-web";
  phase: number;
  timestamp: string;
  dependencies: {
    postgres: DependencyProbe;
    redis: DependencyProbe;
  };
  notes?: string;
}

const DB_TIMEOUT_MS = 3_000;
const REDIS_TIMEOUT_MS = 2_500;

async function probePostgres(): Promise<DependencyProbe> {
  if (!hasDatabaseUrl()) return "not_configured";
  try {
    const { prisma } = await import("@/lib/db/prisma");
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("postgres probe timeout")), DB_TIMEOUT_MS),
      ),
    ]);
    return "ok";
  } catch {
    return "error";
  }
}

async function probeRedis(): Promise<DependencyProbe> {
  if (!hasRedisUrl()) return "not_configured";
  const url = process.env.REDIS_URL!.trim();
  const client = new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: REDIS_TIMEOUT_MS,
    enableReadyCheck: true,
  });
  try {
    await Promise.race([
      client.ping(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("redis probe timeout")), REDIS_TIMEOUT_MS),
      ),
    ]);
    return "ok";
  } catch {
    return "error";
  } finally {
    client.disconnect();
  }
}

export async function getHealthStatus(): Promise<HealthPayload> {
  const phase = getServerPlatformPhase();
  getServerEnv();

  const [postgres, redis] = await Promise.all([probePostgres(), probeRedis()]);

  let status: HealthPayload["status"] = "ok";
  if (postgres === "error") status = "unhealthy";
  else if (redis === "error") status = "degraded";

  return {
    status,
    service: "mbkru-web",
    phase,
    timestamp: new Date().toISOString(),
    dependencies: { postgres, redis },
    notes:
      phase === 1
        ? "Postgres required for admin/news; Redis optional (rate limits when REDIS_URL is set)."
        : undefined,
  };
}
