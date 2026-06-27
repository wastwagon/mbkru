-- CreateEnum
CREATE TYPE "MemberGhanaCardVerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'FAILED');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN "ghanaCardVerificationStatus" "MemberGhanaCardVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "Member" ADD COLUMN "ghanaCardNumberHash" TEXT;
ALTER TABLE "Member" ADD COLUMN "ghanaCardLastFour" VARCHAR(4);
ALTER TABLE "Member" ADD COLUMN "ghanaCardVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Member" ADD COLUMN "ghanaCardLegalSurname" VARCHAR(120);
ALTER TABLE "Member" ADD COLUMN "ghanaCardLegalForenames" VARCHAR(160);
ALTER TABLE "Member" ADD COLUMN "ghanaCardHubtelRef" VARCHAR(128);

-- CreateIndex
CREATE UNIQUE INDEX "Member_ghanaCardNumberHash_key" ON "Member"("ghanaCardNumberHash");

-- CreateIndex
CREATE INDEX "Member_ghanaCardVerificationStatus_idx" ON "Member"("ghanaCardVerificationStatus");
