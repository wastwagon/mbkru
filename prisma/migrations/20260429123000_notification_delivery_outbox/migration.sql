-- CreateEnum
CREATE TYPE "NotificationDeliveryChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationDeliveryKind" AS ENUM ('REPORT_STATUS', 'REPORT_ADMIN_REPLY', 'REPORT_ADMIN_REPLY_VISIBLE_AGAIN');

-- CreateEnum
CREATE TYPE "NotificationDeliveryJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "NotificationDeliveryJob" (
    "id" TEXT NOT NULL,
    "channel" "NotificationDeliveryChannel" NOT NULL,
    "kind" "NotificationDeliveryKind" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "NotificationDeliveryJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDeliveryJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationDeliveryJob_status_availableAt_idx" ON "NotificationDeliveryJob"("status", "availableAt");

-- CreateIndex
CREATE INDEX "NotificationDeliveryJob_channel_status_availableAt_idx" ON "NotificationDeliveryJob"("channel", "status", "availableAt");
