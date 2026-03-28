import "server-only";

import Redis from "ioredis";

import { getClientIp } from "@/lib/client-ip";
import { hasRedisUrl } from "@/lib/env.server";
import { parseRateLimitMax, parseRateLimitWindowMs } from "@/lib/rate-limit-config";

const WINDOW_MS = parseRateLimitWindowMs(process.env.RATE_LIMIT_WINDOW_MS);
const MAX_PER_WINDOW = parseRateLimitMax(process.env.RATE_LIMIT_MAX);

let redis: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (!redis) {
    redis = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }
  return redis;
}

type Bucket = string;

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function memoryAllow(key: Bucket): boolean {
  const now = Date.now();
  const cur = memoryBuckets.get(key);
  if (!cur || now >= cur.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (cur.count >= MAX_PER_WINDOW) return false;
  cur.count += 1;
  return true;
}

async function redisAllow(key: Bucket): Promise<boolean> {
  const client = getRedis();
  if (!client) return memoryAllow(key);
  const k = `mbkru:rl:${key}`;
  try {
    const n = await client.incr(k);
    if (n === 1) await client.pexpire(k, WINDOW_MS);
    return n <= MAX_PER_WINDOW;
  } catch {
    return memoryAllow(key);
  }
}

export { getClientIp } from "@/lib/client-ip";

/**
 * Returns true if the request is within limits. Uses Redis when REDIS_URL is set (shared across instances),
 * otherwise an in-memory window (single-instance / dev only).
 */
export async function allowPublicFormRequest(
  request: Request,
  routeKey: string,
): Promise<boolean> {
  const ip = getClientIp(request);
  const bucket = `${routeKey}:${ip}`;
  if (hasRedisUrl()) return redisAllow(bucket);
  return memoryAllow(bucket);
}
