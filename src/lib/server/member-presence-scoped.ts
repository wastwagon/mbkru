import "server-only";

import Redis from "ioredis";

import { hasRedisUrl } from "@/lib/env.server";

export type MemberPresenceScopeKind = "region" | "community";

/** Recent-activity window for "online" (matches prior regional behaviour). */
export const MEMBER_PRESENCE_ONLINE_MS = 3 * 60 * 1000;

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

function redisKey(kind: MemberPresenceScopeKind, entityId: string): string {
  return `mbkru:presence:${kind}:${entityId}`;
}

const memoryStore = new Map<string, Map<string, number>>();

function memoryKey(kind: MemberPresenceScopeKind, entityId: string): string {
  return `${kind}:${entityId}`;
}

function memoryTouch(kind: MemberPresenceScopeKind, entityId: string, memberId: string, now: number): void {
  const k = memoryKey(kind, entityId);
  let m = memoryStore.get(k);
  if (!m) {
    m = new Map();
    memoryStore.set(k, m);
  }
  m.set(memberId, now);
  for (const [id, ts] of m) {
    if (now - ts > MEMBER_PRESENCE_ONLINE_MS) m.delete(id);
  }
}

function memoryListIds(kind: MemberPresenceScopeKind, entityId: string, now: number): string[] {
  const m = memoryStore.get(memoryKey(kind, entityId));
  if (!m) return [];
  const out: string[] = [];
  for (const [id, ts] of m) {
    if (now - ts <= MEMBER_PRESENCE_ONLINE_MS) out.push(id);
    else m.delete(id);
  }
  return out;
}

export async function touchMemberScopedPresence(
  kind: MemberPresenceScopeKind,
  entityId: string,
  memberId: string,
): Promise<void> {
  const now = Date.now();
  const client = hasRedisUrl() ? getRedis() : null;
  if (!client) {
    memoryTouch(kind, entityId, memberId, now);
    return;
  }
  const key = redisKey(kind, entityId);
  try {
    await client.zadd(key, now, memberId);
    await client.zremrangebyscore(key, 0, now - MEMBER_PRESENCE_ONLINE_MS - 1);
    await client.pexpire(key, MEMBER_PRESENCE_ONLINE_MS + 120_000);
  } catch {
    memoryTouch(kind, entityId, memberId, now);
  }
}

export async function listOnlineMemberIdsInScope(
  kind: MemberPresenceScopeKind,
  entityId: string,
  opts?: { excludeMemberId?: string; limit?: number },
): Promise<string[]> {
  const limit = Math.min(Math.max(opts?.limit ?? 36, 1), 48);
  const now = Date.now();
  const min = now - MEMBER_PRESENCE_ONLINE_MS;
  const client = hasRedisUrl() ? getRedis() : null;
  let ids: string[] = [];
  if (!client) {
    ids = memoryListIds(kind, entityId, now);
  } else {
    const key = redisKey(kind, entityId);
    try {
      await client.zremrangebyscore(key, 0, min - 1);
      const raw = await client.zrangebyscore(key, String(min), String(now), "LIMIT", 0, limit + 8);
      ids = raw;
    } catch {
      ids = memoryListIds(kind, entityId, now);
    }
  }
  const ex = opts?.excludeMemberId;
  const filtered = ex ? ids.filter((id) => id !== ex) : ids;
  return filtered.slice(0, limit);
}

export async function countOnlineInScope(kind: MemberPresenceScopeKind, entityId: string): Promise<number> {
  const now = Date.now();
  const min = now - MEMBER_PRESENCE_ONLINE_MS;
  const client = hasRedisUrl() ? getRedis() : null;
  if (!client) {
    return memoryListIds(kind, entityId, now).length;
  }
  const key = redisKey(kind, entityId);
  try {
    await client.zremrangebyscore(key, 0, min - 1);
    return await client.zcard(key);
  } catch {
    return memoryListIds(kind, entityId, now).length;
  }
}
