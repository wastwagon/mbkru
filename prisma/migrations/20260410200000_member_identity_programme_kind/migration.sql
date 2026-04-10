-- CreateEnum
CREATE TYPE "MemberIdentityVerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN "identityVerificationStatus" "MemberIdentityVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "Member" ADD COLUMN "identityVerificationNote" TEXT;
ALTER TABLE "Member" ADD COLUMN "identityVerifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Member_identityVerificationStatus_idx" ON "Member"("identityVerificationStatus");

-- CreateEnum
CREATE TYPE "ProgrammeEventKind" AS ENUM ('TOWN_HALL', 'REGIONAL_FORUM', 'CONSTITUENCY_DEBATE');

-- AlterTable
ALTER TABLE "TownHallEvent" ADD COLUMN "kind" "ProgrammeEventKind" NOT NULL DEFAULT 'TOWN_HALL';
ALTER TABLE "TownHallEvent" ADD COLUMN "constituencyId" TEXT;

-- CreateIndex
CREATE INDEX "TownHallEvent_constituencyId_idx" ON "TownHallEvent"("constituencyId");
CREATE INDEX "TownHallEvent_kind_idx" ON "TownHallEvent"("kind");

-- AddForeignKey
ALTER TABLE "TownHallEvent" ADD CONSTRAINT "TownHallEvent_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "Constituency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
