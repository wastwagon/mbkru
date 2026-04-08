-- Phase 4: Manifesto registry, promise metadata, parliament audit fields, communities platform

CREATE TABLE "ManifestoDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "partySlug" TEXT NOT NULL,
    "electionCycle" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sha256" TEXT,
    "publishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManifestoDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ManifestoDocument_partySlug_electionCycle_idx" ON "ManifestoDocument"("partySlug", "electionCycle");

ALTER TABLE "CampaignPromise" ADD COLUMN "electionCycle" TEXT,
ADD COLUMN "partySlug" TEXT,
ADD COLUMN "manifestoDocumentId" TEXT,
ADD COLUMN "manifestoPageRef" TEXT,
ADD COLUMN "isGovernmentProgramme" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "CampaignPromise" ADD CONSTRAINT "CampaignPromise_manifestoDocumentId_fkey" FOREIGN KEY ("manifestoDocumentId") REFERENCES "ManifestoDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "CampaignPromise_partySlug_electionCycle_idx" ON "CampaignPromise"("partySlug", "electionCycle");
CREATE INDEX "CampaignPromise_isGovernmentProgramme_idx" ON "CampaignPromise"("isGovernmentProgramme");

ALTER TABLE "ParliamentMember" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN "externalSourceKey" TEXT;

CREATE TYPE "CommunityVisibility" AS ENUM ('PUBLIC', 'MEMBERS_ONLY');
CREATE TYPE "CommunityJoinPolicy" AS ENUM ('OPEN', 'APPROVAL_REQUIRED');
CREATE TYPE "CommunityStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "CommunityMembershipRole" AS ENUM ('MEMBER', 'MODERATOR', 'QUEEN_MOTHER_VERIFIED');
CREATE TYPE "CommunityMembershipState" AS ENUM ('ACTIVE', 'PENDING_JOIN', 'SUSPENDED', 'BANNED');
CREATE TYPE "CommunityPostKind" AS ENUM ('GENERAL', 'CONCERN', 'ANNOUNCEMENT');
CREATE TYPE "CommunityPostModerationStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN');
CREATE TYPE "CommunityVerificationStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE "CommunityPostReportStatus" AS ENUM ('OPEN', 'REVIEWED', 'DISMISSED');

CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "regionId" TEXT,
    "traditionalAreaName" TEXT,
    "visibility" "CommunityVisibility" NOT NULL DEFAULT 'PUBLIC',
    "joinPolicy" "CommunityJoinPolicy" NOT NULL DEFAULT 'OPEN',
    "status" "CommunityStatus" NOT NULL DEFAULT 'DRAFT',
    "coverMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");
CREATE INDEX "Community_regionId_idx" ON "Community"("regionId");
CREATE INDEX "Community_status_idx" ON "Community"("status");

ALTER TABLE "Community" ADD CONSTRAINT "Community_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Community" ADD CONSTRAINT "Community_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CommunityMembership" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "CommunityMembershipRole" NOT NULL DEFAULT 'MEMBER',
    "state" "CommunityMembershipState" NOT NULL DEFAULT 'ACTIVE',
    "banReason" TEXT,
    "bannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityMembership_communityId_memberId_key" ON "CommunityMembership"("communityId", "memberId");
CREATE INDEX "CommunityMembership_communityId_idx" ON "CommunityMembership"("communityId");
CREATE INDEX "CommunityMembership_memberId_idx" ON "CommunityMembership"("memberId");

ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "authorMemberId" TEXT NOT NULL,
    "kind" "CommunityPostKind" NOT NULL,
    "body" TEXT NOT NULL,
    "moderationStatus" "CommunityPostModerationStatus" NOT NULL DEFAULT 'PENDING',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "moderatedAt" TIMESTAMP(3),
    "moderatedByAdminId" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityPost_communityId_createdAt_idx" ON "CommunityPost"("communityId", "createdAt");
CREATE INDEX "CommunityPost_communityId_moderationStatus_idx" ON "CommunityPost"("communityId", "moderationStatus");
CREATE INDEX "CommunityPost_authorMemberId_idx" ON "CommunityPost"("authorMemberId");

ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorMemberId_fkey" FOREIGN KEY ("authorMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_moderatedByAdminId_fkey" FOREIGN KEY ("moderatedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CommunityPostReport" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reporterMemberId" TEXT NOT NULL,
    "reason" VARCHAR(120) NOT NULL,
    "details" TEXT,
    "status" "CommunityPostReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPostReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityPostReport_postId_idx" ON "CommunityPostReport"("postId");
CREATE INDEX "CommunityPostReport_status_idx" ON "CommunityPostReport"("status");

ALTER TABLE "CommunityPostReport" ADD CONSTRAINT "CommunityPostReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityPostReport" ADD CONSTRAINT "CommunityPostReport_reporterMemberId_fkey" FOREIGN KEY ("reporterMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CommunityVerificationRequest" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" "CommunityVerificationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "documentMediaIds" JSONB NOT NULL,
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityVerificationRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityVerificationRequest_communityId_status_idx" ON "CommunityVerificationRequest"("communityId", "status");
CREATE INDEX "CommunityVerificationRequest_memberId_idx" ON "CommunityVerificationRequest"("memberId");

ALTER TABLE "CommunityVerificationRequest" ADD CONSTRAINT "CommunityVerificationRequest_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityVerificationRequest" ADD CONSTRAINT "CommunityVerificationRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "MemberNotification" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MemberNotification_memberId_readAt_idx" ON "MemberNotification"("memberId", "readAt");

ALTER TABLE "MemberNotification" ADD CONSTRAINT "MemberNotification_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
