-- AlterTable
ALTER TABLE "CitizenReportAdminReply" ADD COLUMN "editedByAdminId" TEXT;

-- CreateIndex
CREATE INDEX "CitizenReportAdminReply_editedByAdminId_idx" ON "CitizenReportAdminReply"("editedByAdminId");

-- AddForeignKey
ALTER TABLE "CitizenReportAdminReply" ADD CONSTRAINT "CitizenReportAdminReply_editedByAdminId_fkey" FOREIGN KEY ("editedByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
