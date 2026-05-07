"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { logAdminOperationalAudit } from "@/lib/server/admin-operational-audit";
import { processNotificationOutboxBatch } from "@/lib/server/notification-outbox";

export async function processNotificationQueueAction(formData: FormData) {
  await requireAdminSession();
  const raw = formData.get("limit");
  const parsed = Number.parseInt(typeof raw === "string" ? raw : "20", 10);
  const limit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 100) : 20;
  await processNotificationOutboxBatch(limit);
  revalidatePath("/admin/notifications");
  redirect("/admin/notifications?processed=1");
}

export async function retryNotificationJobAction(formData: FormData) {
  const session = await requireAdminSession();
  const id = typeof formData.get("id") === "string" ? String(formData.get("id")).trim() : "";
  if (!id) {
    redirect("/admin/notifications?error=invalid");
  }
  const result = await prisma.notificationDeliveryJob.updateMany({
    where: { id, status: "FAILED" },
    data: { status: "PENDING", availableAt: new Date(), lastError: null },
  });
  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "NOTIFICATION_JOB_RETRY",
    details: { jobId: id, updated: result.count, source: "admin_action" },
  });
  revalidatePath("/admin/notifications");
  redirect("/admin/notifications?retried=1");
}

export async function resetStuckProcessingJobsAction() {
  const session = await requireAdminSession();
  const staleBefore = new Date(Date.now() - 10 * 60_000);
  const result = await prisma.notificationDeliveryJob.updateMany({
    where: { status: "PROCESSING", updatedAt: { lt: staleBefore } },
    data: { status: "FAILED", lastError: "reset_from_stuck_processing", availableAt: new Date() },
  });
  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "NOTIFICATION_JOB_RESET_STUCK",
    details: { updated: result.count, staleBefore: staleBefore.toISOString(), source: "admin_action" },
  });
  revalidatePath("/admin/notifications");
  redirect("/admin/notifications?reset=1");
}
