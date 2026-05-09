-- AlterTable
ALTER TABLE "CitizenReport" ADD COLUMN "parliamentMemberId" TEXT;

-- CreateIndex
CREATE INDEX "CitizenReport_parliamentMemberId_idx" ON "CitizenReport"("parliamentMemberId");

-- AddForeignKey
ALTER TABLE "CitizenReport" ADD CONSTRAINT "CitizenReport_parliamentMemberId_fkey" FOREIGN KEY ("parliamentMemberId") REFERENCES "ParliamentMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
