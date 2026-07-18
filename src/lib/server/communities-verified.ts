import "server-only";

import { prisma } from "@/lib/db/prisma";

export type VerifiedQueenMotherProfile = {
  membershipId: string;
  displayName: string;
  portrait: { storagePath: string; alt: string | null } | null;
};

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

/** Public profiles for verified Queen Mothers in one community. */
export async function listVerifiedQueenMothersForCommunity(
  communityId: string,
): Promise<VerifiedQueenMotherProfile[]> {
  const rows = await prisma.communityMembership.findMany({
    where: {
      communityId,
      state: "ACTIVE",
      role: "QUEEN_MOTHER_VERIFIED",
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      member: { select: { displayName: true, email: true } },
      portraitMedia: { select: { storagePath: true, alt: true } },
    },
  });

  return rows.map((r) => ({
    membershipId: r.id,
    displayName: r.member.displayName?.trim() || r.member.email.split("@")[0] || "Queen Mother",
    portrait: r.portraitMedia
      ? { storagePath: r.portraitMedia.storagePath, alt: r.portraitMedia.alt }
      : null,
  }));
}

/** Up to 3 portraits per community for browse-card stacks. */
export async function listQueenMotherPortraitPreviewsByCommunityIds(
  communityIds: string[],
): Promise<Map<string, { storagePath: string; alt: string | null; name: string }[]>> {
  const out = new Map<string, { storagePath: string; alt: string | null; name: string }[]>();
  if (communityIds.length === 0) return out;

  const rows = await prisma.communityMembership.findMany({
    where: {
      communityId: { in: communityIds },
      state: "ACTIVE",
      role: "QUEEN_MOTHER_VERIFIED",
      portraitMediaId: { not: null },
    },
    orderBy: { createdAt: "asc" },
    select: {
      communityId: true,
      member: { select: { displayName: true, email: true } },
      portraitMedia: { select: { storagePath: true, alt: true } },
    },
  });

  for (const r of rows) {
    if (!r.portraitMedia) continue;
    const list = out.get(r.communityId) ?? [];
    if (list.length >= 3) continue;
    list.push({
      storagePath: r.portraitMedia.storagePath,
      alt: r.portraitMedia.alt,
      name: r.member.displayName?.trim() || r.member.email.split("@")[0] || "Queen Mother",
    });
    out.set(r.communityId, list);
  }

  return out;
}
