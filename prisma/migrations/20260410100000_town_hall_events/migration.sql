-- CreateEnum
CREATE TYPE "TownHallEventStatus" AS ENUM ('TBC', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "TownHallEvent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "regionId" TEXT,
    "programmeQuarter" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "venueLine" TEXT,
    "status" "TownHallEventStatus" NOT NULL DEFAULT 'TBC',
    "infoUrl" TEXT,
    "sourceCitation" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TownHallEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TownHallEvent_slug_key" ON "TownHallEvent"("slug");

-- CreateIndex
CREATE INDEX "TownHallEvent_regionId_idx" ON "TownHallEvent"("regionId");

-- CreateIndex
CREATE INDEX "TownHallEvent_status_sortOrder_idx" ON "TownHallEvent"("status", "sortOrder");

-- AddForeignKey
ALTER TABLE "TownHallEvent" ADD CONSTRAINT "TownHallEvent_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
