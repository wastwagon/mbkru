import type { CommunityMembershipState, CommunityVisibility } from "@prisma/client";

/** Whether listing posts is allowed (PUBLIC: anyone; MEMBERS_ONLY: active members only). */
export function canReadCommunityPosts(
  visibility: CommunityVisibility,
  membership: { state: CommunityMembershipState } | null,
): boolean {
  if (visibility === "PUBLIC") return true;
  return membership?.state === "ACTIVE";
}

/** Full description/about visible to this viewer. */
export function canReadCommunityFullDetail(
  visibility: CommunityVisibility,
  membership: { state: CommunityMembershipState } | null,
): boolean {
  if (visibility === "PUBLIC") return true;
  return membership?.state === "ACTIVE";
}
