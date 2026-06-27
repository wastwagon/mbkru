-- AlterTable
ALTER TABLE "Community" ADD COLUMN "defaultParliamentMemberId" TEXT;

-- CreateIndex
CREATE INDEX "Community_defaultParliamentMemberId_idx" ON "Community"("defaultParliamentMemberId");

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_defaultParliamentMemberId_fkey" FOREIGN KEY ("defaultParliamentMemberId") REFERENCES "ParliamentMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
