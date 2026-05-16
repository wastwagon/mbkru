-- Promise workflow: blocked (external obstruction) with public reason.
ALTER TYPE "PromiseStatus" ADD VALUE 'BLOCKED';

-- Staff ladder for experience / corroboration on citizen intakes (esp. MP performance).
CREATE TYPE "CitizenReportExperienceVerificationTier" AS ENUM ('UNVERIFIED', 'CORROBORATED', 'DOCUMENTED');

-- Optional structured self-rubric from MP performance submitters (JSON).
ALTER TABLE "CitizenReport" ADD COLUMN "experienceVerificationTier" "CitizenReportExperienceVerificationTier" NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "CitizenReport" ADD COLUMN "mpPerformanceRubric" JSONB;

ALTER TABLE "CampaignPromise" ADD COLUMN "blockedReason" TEXT;

ALTER TABLE "ReportCardCycle" ADD COLUMN "disputeWindowEndsAt" TIMESTAMP(3);

ALTER TABLE "ScorecardEntry" ADD COLUMN "indexAScore" DOUBLE PRECISION;
ALTER TABLE "ScorecardEntry" ADD COLUMN "indexBScore" DOUBLE PRECISION;
ALTER TABLE "ScorecardEntry" ADD COLUMN "indexCScore" DOUBLE PRECISION;
