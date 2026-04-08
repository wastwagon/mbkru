import "server-only";

import type { CommunityMembershipState, CommunityVisibility } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export { canReadCommunityFullDetail, canReadCommunityPosts } from "@/lib/communities-gates";

export type ActiveCommunityRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  traditionalAreaName: string | null;
  joinPolicy: "OPEN" | "APPROVAL_REQUIRED";
  visibility: CommunityVisibility;
  regionId: string | null;
};

const communitySelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  traditionalAreaName: true,
  joinPolicy: true,
  visibility: true,
  regionId: true,
} as const;

/** Any active community by slug (PUBLIC or MEMBERS_ONLY). */
export async function findActiveCommunityBySlug(
  slug: string,
): Promise<ActiveCommunityRow | null> {
  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: communitySelect,
  });
  return c;
}

export async function findMembership(
  communityId: string,
  memberId: string,
): Promise<{ state: CommunityMembershipState; role: string } | null> {
  const m = await prisma.communityMembership.findUnique({
    where: { communityId_memberId: { communityId, memberId } },
    select: { state: true, role: true },
  });
  return m;
}
