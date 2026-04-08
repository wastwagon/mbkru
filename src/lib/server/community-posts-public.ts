import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

/** Published posts plus the viewer's own pending/rejected rows (for transparency). */
export async function listCommunityPostsVisibleToViewer(
  communityId: string,
  viewerMemberId: string | null,
) {
  const or: Prisma.CommunityPostWhereInput[] = [{ moderationStatus: "PUBLISHED" }];
  if (viewerMemberId) {
    or.push({
      authorMemberId: viewerMemberId,
      moderationStatus: { in: ["PENDING", "REJECTED"] },
    });
  }

  return prisma.communityPost.findMany({
    where: { communityId, OR: or },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      author: { select: { id: true, displayName: true } },
    },
  });
}

export type CommunityPostForViewer = Awaited<
  ReturnType<typeof listCommunityPostsVisibleToViewer>
>[number];

/**
 * Single-post fetch using the same visibility rules as the community feed.
 * Caller must enforce `canReadCommunityPosts` for the community first.
 */
export async function getCommunityPostForViewer(
  communityId: string,
  postId: string,
  viewerMemberId: string | null,
): Promise<CommunityPostForViewer | null> {
  const post = await prisma.communityPost.findFirst({
    where: { id: postId, communityId },
    include: {
      author: { select: { id: true, displayName: true } },
    },
  });
  if (!post) return null;

  const published = post.moderationStatus === "PUBLISHED";
  const ownNonPublic =
    viewerMemberId !== null &&
    post.authorMemberId === viewerMemberId &&
    (post.moderationStatus === "PENDING" || post.moderationStatus === "REJECTED");

  if (!published && !ownNonPublic) return null;
  return post;
}
