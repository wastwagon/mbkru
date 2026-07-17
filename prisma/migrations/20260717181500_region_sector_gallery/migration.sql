-- CreateEnum
CREATE TYPE "MediaVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable: classify media; existing private:// rows are verification evidence
ALTER TABLE "Media" ADD COLUMN "visibility" "MediaVisibility" NOT NULL DEFAULT 'PUBLIC';
UPDATE "Media" SET "visibility" = 'PRIVATE' WHERE "storagePath" LIKE 'private://%';

-- CreateTable
CREATE TABLE "RegionSectorImage" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sectorLabel" VARCHAR(80) NOT NULL,
    "alt" VARCHAR(300) NOT NULL,
    "credit" VARCHAR(200),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegionSectorImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegionSectorImage_regionId_sortOrder_idx" ON "RegionSectorImage"("regionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "RegionSectorImage" ADD CONSTRAINT "RegionSectorImage_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RegionSectorImage" ADD CONSTRAINT "RegionSectorImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
