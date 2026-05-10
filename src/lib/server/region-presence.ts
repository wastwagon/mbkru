import "server-only";

import Redis from "ioredis";

import { hasRedisUrl } from "@/lib/env.server";

/** Consider a member "online" for this region if they sent a heartbeat within this window. */
export const REGION_PRESENCE_ONLINE_MS = 3 * 60 * 1000;

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

const memoryByRegion = new Map<string, Map<string, number>>();

function memoryTouch(regionId: string, memberId: string, now: number): void {
  let m = memoryByRegion.get(regionId);
  if (!m) {
    m = new Map();
    memoryByRegion.set(regionId, m);
  }
  m.set(memberId, now);
  for (const [id, ts] of m) {
    if (now - ts > REGION_PRESENCE_ONLINE_MS) m.delete(id);
  }
}

function memoryListIds(regionId: string, now: number): string[] {
  const m = memoryByRegion.get(regionId);
  if (!m) return [];
  const out: string[] = [];
  for (const [id, ts] of m) {
    if (now - ts <= REGION_PRESENCE_ONLINE_MS) out.push(id);
    else m.delete(id);
  }
  return out;
}

/**
 * Record that this member is active (bucketed by their registered home region).
 */
export async function touchMemberRegionPresence(regionId: string, memberId: string): Promise<void> {
  const now = Date.now();
  const client = hasRedisUrl() ? getRedis() : null;
  if (!client) {
    memoryTouch(regionId, memberId, now);
    return;
  }
  const key = `mbkru:presence:region:${regionId}`;
  try {
    await client.zadd(key, now, memberId);
    await client.zremrangebyscore(key, 0, now - REGION_PRESENCE_ONLINE_MS - 1);
    await client.pexpire(key, REGION_PRESENCE_ONLINE_MS + 120_000);
  } catch {
    memoryTouch(regionId, memberId, now);
  }
}

/** Member IDs with a recent heartbeat in this region (excluding `excludeMemberId` for "others online"). */
export async function listOnlineMemberIdsInRegion(
  regionId: string,
  opts?: { excludeMemberId?: string; limit?: number },
): Promise<string[]> {
  const limit = Math.min(Math.max(opts?.limit ?? 36, 1), 48);
  const now = Date.now();
  const min = now - REGION_PRESENCE_ONLINE_MS;
  const client = hasRedisUrl() ? getRedis() : null;
  let ids: string[] = [];
  if (!client) {
    ids = memoryListIds(regionId, now);
  } else {
    const key = `mbkru:presence:region:${regionId}`;
    try {
      await client.zremrangebyscore(key, 0, min - 1);
      const raw = await client.zrangebyscore(key, String(min), String(now), "LIMIT", 0, limit + 8);
      ids = raw;
    } catch {
      ids = memoryListIds(regionId, now);
    }
  }
  const ex = opts?.excludeMemberId;
  const filtered = ex ? ids.filter((id) => id !== ex) : ids;
  return filtered.slice(0, limit);
}

export async function countOnlineInRegion(regionId: string): Promise<number> {
  const now = Date.now();
  const min = now - REGION_PRESENCE_ONLINE_MS;
  const client = hasRedisUrl() ? getRedis() : null;
  if (!client) {
    return memoryListIds(regionId, now).length;
  }
  const key = `mbkru:presence:region:${regionId}`;
  try {
    await client.zremrangebyscore(key, 0, min - 1);
    return await client.zcard(key);
  } catch {
    return memoryListIds(regionId, now).length;
  }
}
