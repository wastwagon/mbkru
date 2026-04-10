-- AlterTable
ALTER TABLE "Member" ADD COLUMN "identityReviewRequestedAt" TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN "identityReviewRequestMessage" VARCHAR(2000);
