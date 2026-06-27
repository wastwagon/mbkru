import "server-only";

import { redirect } from "next/navigation";

import { canManageCommunityAffairs } from "@/lib/communities/community-affairs-roles";
import { getMemberSession } from "@/lib/member/session";
import { findActiveCommunityBySlug, findMembership } from "@/lib/server/communities-access";

export type CommunityLeadershipContext = {
  memberId: string;
  email: string;
  communityId: string;
  communitySlug: string;
  role: "MODERATOR" | "QUEEN_MOTHER_VERIFIED";
};

/** Active community + verified Queen Mother or moderator membership; otherwise redirect to login or community home. */
export async function requireCommunityLeadership(
  communitySlug: string,
  loginNextPath?: string,
): Promise<CommunityLeadershipContext> {
  const slug = communitySlug.trim().toLowerCase();
  const community = await findActiveCommunityBySlug(slug);
  if (!community) redirect("/communities");

  const session = await getMemberSession();
  if (!session) {
    const next = encodeURIComponent(loginNextPath ?? `/communities/${encodeURIComponent(slug)}/manage`);
    redirect(`/login?next=${next}`);
  }

  const membership = await findMembership(community.id, session.memberId);
  if (
    !membership ||
    membership.state !== "ACTIVE" ||
    !canManageCommunityAffairs(membership.role)
  ) {
    redirect(`/communities/${encodeURIComponent(slug)}`);
  }

  return {
    memberId: session.memberId,
    email: session.email,
    communityId: community.id,
    communitySlug: slug,
    role: membership.role as "MODERATOR" | "QUEEN_MOTHER_VERIFIED",
  };
}
