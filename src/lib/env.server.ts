import { z } from "zod";

/**
 * Server-only environment (Route Handlers, Server Components, `server-only` modules).
 * Do not import from client components — use NEXT_PUBLIC_* via props or `platform.ts` on server.
 */

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  PLATFORM_PHASE: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  cached = serverEnvSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    PLATFORM_PHASE: process.env.PLATFORM_PHASE,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
  });
  return cached;
}

export function hasDatabaseUrl(): boolean {
  const url = getServerEnv().DATABASE_URL;
  return typeof url === "string" && url.length > 0;
}

export function hasRedisUrl(): boolean {
  const url = getServerEnv().REDIS_URL;
  return typeof url === "string" && url.length > 0;
}

/**
 * When `MBKRU_REGION_PRESENCE_COUNTS_PUBLIC` is `0` / `false` / `no`, guests do not see aggregate
 * online counts (signed-in members still do). Default: public aggregate counts.
 */
export function regionHubOnlineCountsVisibleToGuests(): boolean {
  const v = process.env.MBKRU_REGION_PRESENCE_COUNTS_PUBLIC?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  return true;
}
