-- Forums per community + optional threading on CommunityPost.

CREATE TABLE "CommunityForum" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityForum_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityForum_communityId_slug_key" ON "CommunityForum"("communityId", "slug");
CREATE INDEX "CommunityForum_communityId_idx" ON "CommunityForum"("communityId");

ALTER TABLE "CommunityForum" ADD CONSTRAINT "CommunityForum_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommunityPost" ADD COLUMN "communityForumId" TEXT,
ADD COLUMN "parentPostId" TEXT,
ADD COLUMN "title" VARCHAR(200);

CREATE INDEX "CommunityPost_communityForumId_createdAt_idx" ON "CommunityPost"("communityForumId", "createdAt");
CREATE INDEX "CommunityPost_parentPostId_createdAt_idx" ON "CommunityPost"("parentPostId", "createdAt");

INSERT INTO "CommunityForum" ("id", "communityId", "slug", "name", "description", "locked", "createdAt", "updatedAt")
SELECT md5(random()::text || clock_timestamp()::text || "Community"."id")::text,
    "Community"."id",
    'general',
    'General discussion',
    'Open conversations and local updates for this community.',
    false,
    NOW(),
    NOW()
FROM "Community";

UPDATE "CommunityPost" AS p
SET "communityForumId" = f."id"
FROM "CommunityForum" AS f
WHERE f."communityId" = p."communityId" AND f."slug" = 'general';

ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_communityForumId_fkey" FOREIGN KEY ("communityForumId") REFERENCES "CommunityForum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
