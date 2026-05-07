-- CreateTable
CREATE TABLE "AdminOperationalAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" VARCHAR(80) NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminOperationalAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminOperationalAuditLog_adminId_createdAt_idx" ON "AdminOperationalAuditLog"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminOperationalAuditLog_action_createdAt_idx" ON "AdminOperationalAuditLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "AdminOperationalAuditLog" ADD CONSTRAINT "AdminOperationalAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
