-- CreateTable
CREATE TABLE "CitizenReportAdminReply" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "adminId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitizenReportAdminReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CitizenReportAdminReply_reportId_createdAt_idx" ON "CitizenReportAdminReply"("reportId", "createdAt");

-- AddForeignKey
ALTER TABLE "CitizenReportAdminReply" ADD CONSTRAINT "CitizenReportAdminReply_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CitizenReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReportAdminReply" ADD CONSTRAINT "CitizenReportAdminReply_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
