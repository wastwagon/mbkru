import "server-only";

import { prisma } from "@/lib/db/prisma";

export type CommunityForumListRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  locked: boolean;
  createdAt: Date;
  /** Published root threads (same bar as public thread lists). */
  publishedThreadCount: number;
  /** Latest **published** post or reply in this forum (by `createdAt`), for activity hints. */
  lastActivityAt: Date | null;
};

export async function listCommunityForums(communityId: string): Promise<CommunityForumListRow[]> {
  const forums = await prisma.communityForum.findMany({
    where: { communityId },
    orderBy: [{ locked: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      locked: true,
      createdAt: true,
      _count: {
        select: {
          posts: {
            where: {
              parentPostId: null,
              moderationStatus: "PUBLISHED",
            },
          },
        },
      },
    },
  });

  if (forums.length === 0) return [];

  const lastByForum = await prisma.communityPost.groupBy({
    by: ["communityForumId"],
    where: {
      communityId,
      communityForumId: { in: forums.map((f) => f.id) },
      moderationStatus: "PUBLISHED",
    },
    _max: { createdAt: true },
  });
  const lastMap = new Map(
    lastByForum
      .filter((r): r is typeof r & { communityForumId: string } => r.communityForumId != null)
      .map((r) => [r.communityForumId, r._max.createdAt]),
  );

  return forums.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    description: f.description,
    locked: f.locked,
    createdAt: f.createdAt,
    publishedThreadCount: f._count.posts,
    lastActivityAt: lastMap.get(f.id) ?? null,
  }));
}

export async function findCommunityForumBySlug(communityId: string, forumSlug: string) {
  return prisma.communityForum.findFirst({
    where: { communityId, slug: forumSlug.trim().toLowerCase() },
  });
}
