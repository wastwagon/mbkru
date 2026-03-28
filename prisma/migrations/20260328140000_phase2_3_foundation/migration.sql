-- Phase 2 & 3 foundation: regions, members, citizen reports, parliament data, scorecards
-- @see docs/PHASES_2_3_IMPLEMENTATION.md

-- CreateEnum
CREATE TYPE "CitizenReportKind" AS ENUM ('VOICE', 'SITUATIONAL_ALERT', 'ELECTION_OBSERVATION');

-- CreateEnum
CREATE TYPE "CitizenReportStatus" AS ENUM ('RECEIVED', 'UNDER_REVIEW', 'ESCALATED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PromiseStatus" AS ENUM ('TRACKING', 'IN_PROGRESS', 'FULFILLED', 'BROKEN', 'DEFERRED');

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Constituency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "Constituency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT,
    "phone" TEXT,
    "regionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitizenReport" (
    "id" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "kind" "CitizenReportKind" NOT NULL,
    "memberId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "regionId" TEXT,
    "constituencyId" TEXT,
    "status" "CitizenReportStatus" NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CitizenReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitizenReportAttachment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitizenReportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParliamentMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "party" TEXT,
    "constituencyId" TEXT,
    "portraitPath" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParliamentMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignPromise" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceLabel" TEXT NOT NULL,
    "sourceDate" TIMESTAMP(3),
    "status" "PromiseStatus" NOT NULL DEFAULT 'TRACKING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignPromise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCardCycle" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "methodology" TEXT,

    CONSTRAINT "ReportCardCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardEntry" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "narrative" TEXT,
    "overallScore" DOUBLE PRECISION,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScorecardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Constituency_slug_key" ON "Constituency"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Constituency_code_key" ON "Constituency"("code");

-- CreateIndex
CREATE INDEX "Constituency_regionId_idx" ON "Constituency"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE INDEX "Member_regionId_idx" ON "Member"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "CitizenReport_trackingCode_key" ON "CitizenReport"("trackingCode");

-- CreateIndex
CREATE INDEX "CitizenReport_kind_status_idx" ON "CitizenReport"("kind", "status");

-- CreateIndex
CREATE INDEX "CitizenReport_memberId_idx" ON "CitizenReport"("memberId");

-- CreateIndex
CREATE INDEX "CitizenReportAttachment_reportId_idx" ON "CitizenReportAttachment"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ParliamentMember_slug_key" ON "ParliamentMember"("slug");

-- CreateIndex
CREATE INDEX "ParliamentMember_constituencyId_idx" ON "ParliamentMember"("constituencyId");

-- CreateIndex
CREATE INDEX "CampaignPromise_memberId_idx" ON "CampaignPromise"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportCardCycle_year_key" ON "ReportCardCycle"("year");

-- CreateIndex
CREATE UNIQUE INDEX "ScorecardEntry_cycleId_memberId_key" ON "ScorecardEntry"("cycleId", "memberId");

-- AddForeignKey
ALTER TABLE "Constituency" ADD CONSTRAINT "Constituency_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReport" ADD CONSTRAINT "CitizenReport_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReport" ADD CONSTRAINT "CitizenReport_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReport" ADD CONSTRAINT "CitizenReport_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "Constituency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReportAttachment" ADD CONSTRAINT "CitizenReportAttachment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CitizenReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParliamentMember" ADD CONSTRAINT "ParliamentMember_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "Constituency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignPromise" ADD CONSTRAINT "CampaignPromise_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ParliamentMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorecardEntry" ADD CONSTRAINT "ScorecardEntry_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ReportCardCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorecardEntry" ADD CONSTRAINT "ScorecardEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "ParliamentMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
