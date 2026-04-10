-- Petitions (member-authored) + staff-approved public "cause" threads on Voice reports (support + comments).

CREATE TYPE "PetitionStatus" AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED');
CREATE TYPE "PublicCauseCommentStatus" AS ENUM ('VISIBLE', 'HIDDEN');

ALTER TABLE "CitizenReport" ADD COLUMN     "publicCauseSlug" VARCHAR(120),
ADD COLUMN     "publicCauseTitle" VARCHAR(240),
ADD COLUMN     "publicCauseSummary" TEXT,
ADD COLUMN     "publicCauseOpenedAt" TIMESTAMP(3),
ADD COLUMN     "publicCauseClosed" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "CitizenReport_publicCauseSlug_key" ON "CitizenReport"("publicCauseSlug");
CREATE INDEX "CitizenReport_publicCauseOpenedAt_idx" ON "CitizenReport"("publicCauseOpenedAt");

CREATE TABLE "CitizenReportPublicComment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "body" VARCHAR(2000) NOT NULL,
    "status" "PublicCauseCommentStatus" NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitizenReportPublicComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CitizenReportPublicComment_reportId_createdAt_idx" ON "CitizenReportPublicComment"("reportId", "createdAt");
CREATE INDEX "CitizenReportPublicComment_memberId_idx" ON "CitizenReportPublicComment"("memberId");

ALTER TABLE "CitizenReportPublicComment" ADD CONSTRAINT "CitizenReportPublicComment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CitizenReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CitizenReportPublicComment" ADD CONSTRAINT "CitizenReportPublicComment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CitizenReportSupport" (
    "reportId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitizenReportSupport_pkey" PRIMARY KEY ("reportId","memberId")
);

CREATE INDEX "CitizenReportSupport_reportId_idx" ON "CitizenReportSupport"("reportId");

ALTER TABLE "CitizenReportSupport" ADD CONSTRAINT "CitizenReportSupport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CitizenReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CitizenReportSupport" ADD CONSTRAINT "CitizenReportSupport_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Petition" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "title" VARCHAR(280) NOT NULL,
    "summary" VARCHAR(500),
    "body" TEXT NOT NULL,
    "targetSignatures" INTEGER,
    "regionId" TEXT,
    "authorMemberId" TEXT NOT NULL,
    "status" "PetitionStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Petition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Petition_slug_key" ON "Petition"("slug");
CREATE INDEX "Petition_status_createdAt_idx" ON "Petition"("status", "createdAt");
CREATE INDEX "Petition_authorMemberId_idx" ON "Petition"("authorMemberId");

ALTER TABLE "Petition" ADD CONSTRAINT "Petition_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Petition" ADD CONSTRAINT "Petition_authorMemberId_fkey" FOREIGN KEY ("authorMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "PetitionSignature" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "memberId" TEXT,
    "signerEmail" VARCHAR(254) NOT NULL,
    "signerName" VARCHAR(120),
    "consentShowName" BOOLEAN NOT NULL DEFAULT false,
    "consentUpdates" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetitionSignature_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PetitionSignature_petitionId_signerEmail_key" ON "PetitionSignature"("petitionId", "signerEmail");
CREATE INDEX "PetitionSignature_petitionId_idx" ON "PetitionSignature"("petitionId");
CREATE INDEX "PetitionSignature_memberId_idx" ON "PetitionSignature"("memberId");

ALTER TABLE "PetitionSignature" ADD CONSTRAINT "PetitionSignature_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "Petition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PetitionSignature" ADD CONSTRAINT "PetitionSignature_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
