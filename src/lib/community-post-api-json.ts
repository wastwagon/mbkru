/**
 * Stable JSON shapes for public community post APIs (`/api/communities/.../posts`).
 * Keeps list + detail responses aligned for clients and tests.
 */

export type CommunityPostAuthorApiJson = {
  id: string;
  displayName: string | null;
};

export type CommunityPostForumApiJson = {
  slug: string;
  name: string;
};

/** Row in GET /api/communities/[slug]/posts and POST create response. */
export type CommunityPostListApiJson = {
  id: string;
  kind: string;
  title: string | null;
  body: string;
  moderationStatus: string;
  pinned: boolean;
  parentPostId: string | null;
  createdAt: string;
  lastActivityAt: string;
  /** Only on root threads: count of published replies. */
  replyCount?: number;
  author: CommunityPostAuthorApiJson;
  forum: CommunityPostForumApiJson | null;
};

type PostRowForApi = {
  id: string;
  kind: string;
  title: string | null;
  body: string;
  moderationStatus: string;
  pinned: boolean;
  parentPostId: string | null;
  createdAt: Date;
  lastActivityAt: Date;
  author: CommunityPostAuthorApiJson;
  communityForum: CommunityPostForumApiJson | null;
  _count?: { replies: number };
};

export function toCommunityPostListApiJson(p: PostRowForApi): CommunityPostListApiJson {
  const base: CommunityPostListApiJson = {
    id: p.id,
    kind: p.kind,
    title: p.title,
    body: p.body,
    moderationStatus: p.moderationStatus,
    pinned: p.pinned,
    parentPostId: p.parentPostId,
    createdAt: p.createdAt.toISOString(),
    lastActivityAt: p.lastActivityAt.toISOString(),
    author: p.author,
    forum: p.communityForum,
  };
  if (p.parentPostId === null) {
    base.replyCount = p._count?.replies ?? 0;
  }
  return base;
}

export type CommunityPostDetailApiJson = CommunityPostListApiJson & {
  community: { slug: string; name: string };
};

export function toCommunityPostDetailApiJson(
  p: PostRowForApi,
  community: { slug: string; name: string },
): CommunityPostDetailApiJson {
  return {
    ...toCommunityPostListApiJson(p),
    community,
  };
}
