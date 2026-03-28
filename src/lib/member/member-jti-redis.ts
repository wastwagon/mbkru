import "server-only";

import Redis from "ioredis";

import { hasRedisUrl } from "@/lib/env.server";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.REDIS_URL?.trim();
  if (!url || !hasRedisUrl()) return null;
  if (!redis) {
    redis = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }
  return redis;
}

const key = (jti: string) => `mbkru:member:jti:${jti}`;

/** When Redis is configured, associate a JWT `jti` with an active session (server-side logout). */
export async function rememberMemberJti(jti: string, ttlSeconds: number): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.set(key(jti), "1", "EX", ttlSeconds);
  } catch {
    /* ignore — session still valid via JWT until expiry */
  }
}

/** If Redis is off, always true. If on, token must still be present. */
export async function isMemberJtiActive(jti: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return true;
  try {
    const v = await r.get(key(jti));
    return v === "1";
  } catch {
    return true;
  }
}

export async function revokeMemberJti(jti: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.del(key(jti));
  } catch {
    /* ignore */
  }
}
