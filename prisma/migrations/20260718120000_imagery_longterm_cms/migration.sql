-- Durable imagery CMS: event featured photos, petition topics, partners/leadership/endorsements

CREATE TYPE "PetitionTopic" AS ENUM (
  'GOVERNANCE',
  'INFRASTRUCTURE',
  'HEALTH',
  'EDUCATION',
  'ENVIRONMENT',
  'SECURITY',
  'ECONOMY',
  'OTHER'
);

CREATE TYPE "PartnerCategory" AS ENUM (
  'GOVERNMENT',
  'CIVIL_SOCIETY',
  'DEVELOPMENT',
  'FOUNDATION',
  'OTHER'
);

ALTER TABLE "TownHallEvent" ADD COLUMN "featuredMediaId" TEXT;

ALTER TABLE "TownHallEvent"
  ADD CONSTRAINT "TownHallEvent_featuredMediaId_fkey"
  FOREIGN KEY ("featuredMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Petition" ADD COLUMN "topic" "PetitionTopic" NOT NULL DEFAULT 'OTHER';

CREATE INDEX "Petition_topic_status_idx" ON "Petition"("topic", "status");

CREATE TABLE "Partner" (
  "id" TEXT NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "slug" VARCHAR(140) NOT NULL,
  "category" "PartnerCategory" NOT NULL DEFAULT 'OTHER',
  "websiteUrl" VARCHAR(500),
  "summary" VARCHAR(600),
  "logoMediaId" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");
CREATE INDEX "Partner_publishedAt_sortOrder_idx" ON "Partner"("publishedAt", "sortOrder");
CREATE INDEX "Partner_category_sortOrder_idx" ON "Partner"("category", "sortOrder");

ALTER TABLE "Partner"
  ADD CONSTRAINT "Partner_logoMediaId_fkey"
  FOREIGN KEY ("logoMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "LeadershipProfile" (
  "id" TEXT NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "roleTitle" VARCHAR(200) NOT NULL,
  "bio" TEXT,
  "portraitMediaId" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LeadershipProfile_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LeadershipProfile_publishedAt_sortOrder_idx" ON "LeadershipProfile"("publishedAt", "sortOrder");

ALTER TABLE "LeadershipProfile"
  ADD CONSTRAINT "LeadershipProfile_portraitMediaId_fkey"
  FOREIGN KEY ("portraitMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Endorsement" (
  "id" TEXT NOT NULL,
  "quote" VARCHAR(800) NOT NULL,
  "attributionName" VARCHAR(200) NOT NULL,
  "attributionRole" VARCHAR(200),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Endorsement_publishedAt_sortOrder_idx" ON "Endorsement"("publishedAt", "sortOrder");
