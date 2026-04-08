-- Operations / SLA fields for admin triage (situational alerts, election reports, etc.)

ALTER TABLE "CitizenReport" ADD COLUMN "slaDueAt" TIMESTAMP(3);
ALTER TABLE "CitizenReport" ADD COLUMN "operationsPlaybookKey" TEXT;
ALTER TABLE "CitizenReport" ADD COLUMN "staffNotes" TEXT;

CREATE INDEX "CitizenReport_slaDueAt_idx" ON "CitizenReport"("slaDueAt");
