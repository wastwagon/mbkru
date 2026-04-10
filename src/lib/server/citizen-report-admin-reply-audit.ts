import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export type CitizenReportAdminReplyAuditAction = "REPLY_POSTED" | "REPLY_EDITED" | "REPLY_VISIBILITY";

export async function logCitizenReportAdminReplyAudit(params: {
  replyId: string;
  reportId: string;
  adminId: string;
  action: CitizenReportAdminReplyAuditAction;
  details?: Prisma.InputJsonValue | null;
}): Promise<void> {
  await prisma.citizenReportAdminReplyAuditLog.create({
    data: {
      replyId: params.replyId,
      reportId: params.reportId,
      adminId: params.adminId,
      action: params.action,
      details: params.details ?? undefined,
    },
  });
}
