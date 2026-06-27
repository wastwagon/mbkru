-- CreateEnum
CREATE TYPE "CitizenReportIntakeSource" AS ENUM ('CITIZEN_VOICE', 'COUNCIL_EVALUATION');

-- CreateEnum
CREATE TYPE "CouncilMpEvaluationStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- AlterTable
ALTER TABLE "CitizenReport" ADD COLUMN "intakeSource" "CitizenReportIntakeSource" NOT NULL DEFAULT 'CITIZEN_VOICE';
ALTER TABLE "CitizenReport" ADD COLUMN "communityId" TEXT;

-- CreateTable
CREATE TABLE "CouncilMpEvaluation" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "parliamentMemberId" TEXT NOT NULL,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "meetingSummary" TEXT NOT NULL,
    "projectsDiscussed" TEXT,
    "attendeesNotes" TEXT,
    "rubric" JSONB,
    "status" "CouncilMpEvaluationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByMemberId" TEXT NOT NULL,
    "signedByMemberId" TEXT,
    "signedAt" TIMESTAMP(3),
    "citizenReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouncilMpEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CouncilMpEvaluation_citizenReportId_key" ON "CouncilMpEvaluation"("citizenReportId");

-- CreateIndex
CREATE INDEX "CouncilMpEvaluation_communityId_status_idx" ON "CouncilMpEvaluation"("communityId", "status");

-- CreateIndex
CREATE INDEX "CouncilMpEvaluation_parliamentMemberId_idx" ON "CouncilMpEvaluation"("parliamentMemberId");

-- CreateIndex
CREATE INDEX "CouncilMpEvaluation_createdByMemberId_idx" ON "CouncilMpEvaluation"("createdByMemberId");

-- CreateIndex
CREATE INDEX "CitizenReport_intakeSource_idx" ON "CitizenReport"("intakeSource");

-- CreateIndex
CREATE INDEX "CitizenReport_communityId_idx" ON "CitizenReport"("communityId");

-- AddForeignKey
ALTER TABLE "CitizenReport" ADD CONSTRAINT "CitizenReport_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilMpEvaluation" ADD CONSTRAINT "CouncilMpEvaluation_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilMpEvaluation" ADD CONSTRAINT "CouncilMpEvaluation_parliamentMemberId_fkey" FOREIGN KEY ("parliamentMemberId") REFERENCES "ParliamentMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilMpEvaluation" ADD CONSTRAINT "CouncilMpEvaluation_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilMpEvaluation" ADD CONSTRAINT "CouncilMpEvaluation_signedByMemberId_fkey" FOREIGN KEY ("signedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilMpEvaluation" ADD CONSTRAINT "CouncilMpEvaluation_citizenReportId_fkey" FOREIGN KEY ("citizenReportId") REFERENCES "CitizenReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
