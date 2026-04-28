import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

const LIMIT_COMMUNITIES = 15;
const LIMIT_POSTS = 15;

export { normalizeCommunitySearchQuery } from "@/lib/validation/communities";

export type CommunitySearchHit = {
  slug: string;
  name: string;
  traditionalAreaName: string | null;
  joinPolicy: "OPEN" | "APPROVAL_REQUIRED";
  visibility: "PUBLIC" | "MEMBERS_ONLY";
  description: string | null;
  region: { name: string; slug: string } | null;
  memberCount: number;
};

export type CommunityPostSearchHit = {
  postId: string;
  communitySlug: string;
  communityName: string;
  snippet: string;
  createdAt: string;
};

export type CommunitiesSearchResult = {
  query: string;
  communities: CommunitySearchHit[];
  posts: CommunityPostSearchHit[];
};

export async function searchCommunitiesAndPosts(normalizedQuery: string): Promise<CommunitiesSearchResult> {
  const q = normalizedQuery;

  const communityRows = await prisma.$queryRaw<
    Array<{
      id: string;
      slug: string;
      name: string;
      traditionalAreaName: string | null;
      joinPolicy: string;
      visibility: string;
      description: string | null;
      rank: number;
    }>
  >(Prisma.sql`
    SELECT c.id, c.slug, c.name, c."traditionalAreaName", c."joinPolicy", c.visibility, c.description,
      ts_rank(
        to_tsvector(
          'simple',
          coalesce(c.name, '') || ' ' || coalesce(c.description, '') || ' ' || coalesce(c."traditionalAreaName", '')
        ),
        plainto_tsquery('simple', ${q})
      ) AS rank
    FROM "Community" c
    WHERE c.status = 'ACTIVE'
      AND to_tsvector(
        'simple',
        coalesce(c.name, '') || ' ' || coalesce(c.description, '') || ' ' || coalesce(c."traditionalAreaName", '')
      ) @@ plainto_tsquery('simple', ${q})
    ORDER BY rank DESC, c.name ASC
    LIMIT ${LIMIT_COMMUNITIES}
  `);

  const postRows = await prisma.$queryRaw<
    Array<{
      postId: string;
      body: string;
      createdAt: Date;
      communitySlug: string;
      communityName: string;
      rank: number;
    }>
  >(Prisma.sql`
    SELECT p.id AS "postId", p.body, p."createdAt",
      c.slug AS "communitySlug", c.name AS "communityName",
      ts_rank(to_tsvector('simple', coalesce(p.body, '')), plainto_tsquery('simple', ${q})) AS rank
    FROM "CommunityPost" p
    INNER JOIN "Community" c ON c.id = p."communityId"
    WHERE c.status = 'ACTIVE'
      AND c.visibility = 'PUBLIC'
      AND p."moderationStatus" = 'PUBLISHED'
      AND p."parentPostId" IS NULL
      AND to_tsvector('simple', coalesce(p.body, '')) @@ plainto_tsquery('simple', ${q})
    ORDER BY rank DESC, p."createdAt" DESC
    LIMIT ${LIMIT_POSTS}
  `);

  const ids = communityRows.map((r) => r.id);
  const counts =
    ids.length > 0
      ? await prisma.community.findMany({
          where: { id: { in: ids } },
          select: {
            id: true,
            _count: { select: { memberships: true } },
            region: { select: { name: true, slug: true } },
          },
        })
      : [];
  const countById = new Map(counts.map((c) => [c.id, c]));

  const communities: CommunitySearchHit[] = communityRows.map((row) => {
    const extra = countById.get(row.id);
    const jp = row.joinPolicy === "APPROVAL_REQUIRED" ? "APPROVAL_REQUIRED" : "OPEN";
    const vis = row.visibility === "MEMBERS_ONLY" ? "MEMBERS_ONLY" : "PUBLIC";
    return {
      slug: row.slug,
      name: row.name,
      traditionalAreaName: row.traditionalAreaName,
      joinPolicy: jp,
      visibility: vis,
      description: vis === "MEMBERS_ONLY" ? null : row.description,
      region: extra?.region ? { name: extra.region.name, slug: extra.region.slug } : null,
      memberCount: extra?._count.memberships ?? 0,
    };
  });

  const posts: CommunityPostSearchHit[] = postRows.map((row) => ({
    postId: row.postId,
    communitySlug: row.communitySlug,
    communityName: row.communityName,
    snippet: row.body.length > 220 ? `${row.body.slice(0, 220).trim()}…` : row.body,
    createdAt: row.createdAt.toISOString(),
  }));

  return { query: q, communities, posts };
}
