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

const key = (jti: string) => `mbkru:member:pwdreset:${jti}`;

/** Mark a password-reset token as valid until consumed or TTL expires. */
export async function rememberPasswordResetJti(jti: string, ttlSeconds: number): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.set(key(jti), "1", "EX", ttlSeconds);
  } catch {
    /* ignore */
  }
}

/** Without Redis, tokens are single-use only via JWT expiry. With Redis, must still exist. */
export async function isPasswordResetJtiActive(jti: string): Promise<boolean> {
  const r = getRedis();
  if (!r) return true;
  try {
    return (await r.get(key(jti))) === "1";
  } catch {
    return true;
  }
}

export async function consumePasswordResetJti(jti: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.del(key(jti));
  } catch {
    /* ignore */
  }
}
