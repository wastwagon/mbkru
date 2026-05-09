-- Phase A: public discussion threads per Voice report (comments + reactions).

CREATE TYPE "CommentReactionKind" AS ENUM ('LIKE', 'THANK', 'INSIGHT');

ALTER TABLE "CitizenReport" ADD COLUMN "discussionEnabled" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "CitizenReportPublicComment" ADD COLUMN "parentCommentId" TEXT;

CREATE INDEX "CitizenReportPublicComment_parentCommentId_idx" ON "CitizenReportPublicComment"("parentCommentId");

ALTER TABLE "CitizenReportPublicComment"
ADD CONSTRAINT "CitizenReportPublicComment_parentCommentId_fkey"
FOREIGN KEY ("parentCommentId") REFERENCES "CitizenReportPublicComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CitizenReportCommentReaction" (
    "commentId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "kind" "CommentReactionKind" NOT NULL DEFAULT 'LIKE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitizenReportCommentReaction_pkey" PRIMARY KEY ("commentId","memberId")
);

CREATE INDEX "CitizenReportCommentReaction_commentId_idx" ON "CitizenReportCommentReaction"("commentId");

ALTER TABLE "CitizenReportCommentReaction"
ADD CONSTRAINT "CitizenReportCommentReaction_commentId_fkey"
FOREIGN KEY ("commentId") REFERENCES "CitizenReportPublicComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CitizenReportCommentReaction"
ADD CONSTRAINT "CitizenReportCommentReaction_memberId_fkey"
FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
