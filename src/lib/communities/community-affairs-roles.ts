import type { CommunityMembershipRole } from "@prisma/client";

/**
 * Roles that may run community affairs on MBKRU: official announcements, locked forums,
 * creating forums, and immediate publish where product rules allow.
 * **Queen Mother (verified)** is the programme role for traditional leadership (including council-facing work);
 * **Moderator** is programme/MBKRU staff.
 */
export function canManageCommunityAffairs(role: CommunityMembershipRole): boolean {
  return role === "MODERATOR" || role === "QUEEN_MOTHER_VERIFIED";
}

/** Human-readable label for membership UI (community context). */
export function communityMembershipRoleLabel(role: CommunityMembershipRole): string {
  switch (role) {
    case "QUEEN_MOTHER_VERIFIED":
      return "Queen Mother (verified)";
    case "MODERATOR":
      return "Moderator";
    default:
      return "Member";
  }
}
