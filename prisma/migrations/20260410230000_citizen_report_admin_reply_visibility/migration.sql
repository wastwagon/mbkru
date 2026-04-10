-- AlterTable
ALTER TABLE "CitizenReportAdminReply" ADD COLUMN "visibleToSubmitter" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CitizenReportAdminReply" ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "CitizenReportAdminReply" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

ALTER TABLE "CitizenReportAdminReply" ALTER COLUMN "updatedAt" SET NOT NULL;
