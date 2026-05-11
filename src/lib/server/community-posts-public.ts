import "server-only";

import type { CommunityPostKind, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

function visibilityOrClause(viewerMemberId: string | null): Prisma.CommunityPostWhereInput[] {
  const or: Prisma.CommunityPostWhereInput[] = [{ moderationStatus: "PUBLISHED" }];
  if (viewerMemberId) {
    or.push({
      authorMemberId: viewerMemberId,
      moderationStatus: { in: ["PENDING", "REJECTED"] },
    });
  }
  return or;
}

/** Root posts only (threads). Optionally filter to one forum and/or post kinds. */
export async function listCommunityPostsVisibleToViewer(
  communityId: string,
  viewerMemberId: string | null,
  opts?: { forumId?: string | null; kinds?: CommunityPostKind[] },
) {
  const forumFilter: Prisma.CommunityPostWhereInput =
    opts?.forumId === undefined
      ? {}
      : opts.forumId === null
        ? { communityForumId: null }
        : { communityForumId: opts.forumId };

  const kindFilter: Prisma.CommunityPostWhereInput =
    opts?.kinds && opts.kinds.length > 0 ? { kind: { in: opts.kinds } } : {};

  return prisma.communityPost.findMany({
    where: {
      communityId,
      parentPostId: null,
      ...forumFilter,
      ...kindFilter,
      OR: visibilityOrClause(viewerMemberId),
    },
    orderBy: [{ pinned: "desc" }, { lastActivityAt: "desc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      author: { select: { id: true, displayName: true } },
      communityForum: { select: { slug: true, name: true } },
      _count: {
        select: {
          replies: {
            where: { moderationStatus: "PUBLISHED" },
          },
        },
      },
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
      communityForum: { select: { slug: true, name: true } },
      _count: {
        select: {
          replies: {
            where: { moderationStatus: "PUBLISHED" },
          },
        },
      },
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

/** Flat replies under a root thread (same visibility rules as feed). */
export async function listCommunityPostRepliesVisibleToViewer(
  communityId: string,
  rootPostId: string,
  viewerMemberId: string | null,
) {
  return prisma.communityPost.findMany({
    where: {
      communityId,
      parentPostId: rootPostId,
      OR: visibilityOrClause(viewerMemberId),
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: {
      author: { select: { id: true, displayName: true } },
    },
  });
}

export type CommunityPostReplyForViewer = Awaited<
  ReturnType<typeof listCommunityPostRepliesVisibleToViewer>
>[number];
