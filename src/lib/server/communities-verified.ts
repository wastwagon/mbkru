import "server-only";

import { prisma } from "@/lib/db/prisma";

/** Active Queen Mother (verified) membership counts keyed by community id. */
export async function countVerifiedQueenMothersByCommunityIds(
  communityIds: string[],
): Promise<Map<string, number>> {
  if (communityIds.length === 0) return new Map();

  const rows = await prisma.communityMembership.groupBy({
    by: ["communityId"],
    where: {
      communityId: { in: communityIds },
      state: "ACTIVE",
      role: "QUEEN_MOTHER_VERIFIED",
    },
    _count: { _all: true },
  });

  return new Map(rows.map((r) => [r.communityId, r._count._all]));
}

export async function countVerifiedQueenMothersForCommunity(communityId: string): Promise<number> {
  return prisma.communityMembership.count({
    where: {
      communityId,
      state: "ACTIVE",
      role: "QUEEN_MOTHER_VERIFIED",
    },
  });
}

export async function countVerifiedQueenMothersByCommunitySlugs(
  slugs: string[],
): Promise<Map<string, number>> {
  if (slugs.length === 0) return new Map();

  const rows = await prisma.community.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const byId = await countVerifiedQueenMothersByCommunityIds(rows.map((r) => r.id));
  return new Map(rows.map((r) => [r.slug, byId.get(r.id) ?? 0]));
}
