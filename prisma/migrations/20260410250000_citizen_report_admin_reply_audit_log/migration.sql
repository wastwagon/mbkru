-- CreateTable
CREATE TABLE "CitizenReportAdminReplyAuditLog" (
    "id" TEXT NOT NULL,
    "replyId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "adminId" TEXT,
    "action" VARCHAR(32) NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitizenReportAdminReplyAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CitizenReportAdminReplyAuditLog_reportId_createdAt_idx" ON "CitizenReportAdminReplyAuditLog"("reportId", "createdAt");

-- CreateIndex
CREATE INDEX "CitizenReportAdminReplyAuditLog_replyId_createdAt_idx" ON "CitizenReportAdminReplyAuditLog"("replyId", "createdAt");

-- AddForeignKey
ALTER TABLE "CitizenReportAdminReplyAuditLog" ADD CONSTRAINT "CitizenReportAdminReplyAuditLog_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "CitizenReportAdminReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReportAdminReplyAuditLog" ADD CONSTRAINT "CitizenReportAdminReplyAuditLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CitizenReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenReportAdminReplyAuditLog" ADD CONSTRAINT "CitizenReportAdminReplyAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
