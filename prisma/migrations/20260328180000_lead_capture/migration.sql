-- CreateEnum
CREATE TYPE "LeadCaptureSource" AS ENUM ('NEWSLETTER', 'EARLY_ACCESS', 'PARLIAMENT_TRACKER');

-- CreateTable
CREATE TABLE "LeadCapture" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" "LeadCaptureSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadCapture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadCapture_email_source_key" ON "LeadCapture"("email", "source");

-- CreateIndex
CREATE INDEX "LeadCapture_source_createdAt_idx" ON "LeadCapture"("source", "createdAt");
