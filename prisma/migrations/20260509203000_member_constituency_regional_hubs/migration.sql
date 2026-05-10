-- AlterTable
ALTER TABLE "Member" ADD COLUMN "constituencyId" TEXT;

-- CreateIndex
CREATE INDEX "Member_constituencyId_idx" ON "Member"("constituencyId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "Constituency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
