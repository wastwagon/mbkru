-- Bump ordering for forum threads: roots sort by recent discussion.
ALTER TABLE "CommunityPost" ADD COLUMN "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "CommunityPost" SET "lastActivityAt" = "createdAt";

CREATE INDEX "CommunityPost_communityForumId_lastActivityAt_idx" ON "CommunityPost"("communityForumId", "lastActivityAt");
