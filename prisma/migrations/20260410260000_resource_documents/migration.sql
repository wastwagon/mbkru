-- CreateEnum
CREATE TYPE "ResourceDocumentCategory" AS ENUM ('REPORTS', 'POLICY_BRIEFS', 'RESEARCH', 'OTHER');

-- CreateTable
CREATE TABLE "ResourceDocument" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "summary" VARCHAR(600),
    "category" "ResourceDocumentCategory" NOT NULL DEFAULT 'OTHER',
    "filePath" VARCHAR(500) NOT NULL,
    "originalFilename" VARCHAR(280) NOT NULL,
    "mimeType" VARCHAR(120) NOT NULL,
    "fileSize" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResourceDocument_slug_key" ON "ResourceDocument"("slug");

-- CreateIndex
CREATE INDEX "ResourceDocument_publishedAt_sortOrder_idx" ON "ResourceDocument"("publishedAt", "sortOrder");

-- CreateIndex
CREATE INDEX "ResourceDocument_category_sortOrder_idx" ON "ResourceDocument"("category", "sortOrder");
