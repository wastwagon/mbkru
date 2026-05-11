import "server-only";

import {
  countOnlineInScope,
  listOnlineMemberIdsInScope,
  MEMBER_PRESENCE_ONLINE_MS,
  touchMemberScopedPresence,
} from "@/lib/server/member-presence-scoped";

/** @deprecated Use `MEMBER_PRESENCE_ONLINE_MS` from `member-presence-scoped`. */
export const REGION_PRESENCE_ONLINE_MS = MEMBER_PRESENCE_ONLINE_MS;

export async function touchMemberRegionPresence(regionId: string, memberId: string): Promise<void> {
  return touchMemberScopedPresence("region", regionId, memberId);
}

export async function listOnlineMemberIdsInRegion(
  regionId: string,
  opts?: { excludeMemberId?: string; limit?: number },
): Promise<string[]> {
  return listOnlineMemberIdsInScope("region", regionId, opts);
}

export async function countOnlineInRegion(regionId: string): Promise<number> {
  return countOnlineInScope("region", regionId);
}
