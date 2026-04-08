-- AlterTable
ALTER TABLE "CampaignPromise" ADD COLUMN "policySector" TEXT;

CREATE INDEX "CampaignPromise_policySector_idx" ON "CampaignPromise"("policySector");
