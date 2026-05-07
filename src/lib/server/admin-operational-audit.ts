import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export async function logAdminOperationalAudit(params: {
  adminId: string;
  action: string;
  details?: Prisma.InputJsonValue | null;
}): Promise<void> {
  await prisma.adminOperationalAuditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action.slice(0, 80),
      details: params.details ?? undefined,
    },
  });
}
