import "server-only";

import {
  countOnlineInScope,
  listOnlineMemberIdsInScope,
  touchMemberScopedPresence,
} from "@/lib/server/member-presence-scoped";

export async function touchMemberCommunityPresence(communityId: string, memberId: string): Promise<void> {
  return touchMemberScopedPresence("community", communityId, memberId);
}

export async function listOnlineMemberIdsInCommunity(
  communityId: string,
  opts?: { excludeMemberId?: string; limit?: number },
): Promise<string[]> {
  return listOnlineMemberIdsInScope("community", communityId, opts);
}

export async function countOnlineInCommunity(communityId: string): Promise<number> {
  return countOnlineInScope("community", communityId);
}
