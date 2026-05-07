import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { logAdminOperationalAudit } from "@/lib/server/admin-operational-audit";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

const bodySchema = z.object({
  id: z.string().cuid().optional(),
  resetStuckProcessing: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await allowAdminSessionRequest(session.adminId, "admin-notifications-retry"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.id) {
    const result = await prisma.notificationDeliveryJob.updateMany({
      where: { id: parsed.data.id, status: "FAILED" },
      data: { status: "PENDING", availableAt: new Date(), lastError: null },
    });
    await logAdminOperationalAudit({
      adminId: session.adminId,
      action: "NOTIFICATION_JOB_RETRY",
      details: { jobId: parsed.data.id, updated: result.count },
    });
    return NextResponse.json({ ok: true, updated: result.count });
  }

  if (parsed.data.resetStuckProcessing) {
    const staleBefore = new Date(Date.now() - 10 * 60_000);
    const result = await prisma.notificationDeliveryJob.updateMany({
      where: { status: "PROCESSING", updatedAt: { lt: staleBefore } },
      data: { status: "FAILED", lastError: "reset_from_stuck_processing", availableAt: new Date() },
    });
    await logAdminOperationalAudit({
      adminId: session.adminId,
      action: "NOTIFICATION_JOB_RESET_STUCK",
      details: { updated: result.count, staleBefore: staleBefore.toISOString() },
    });
    return NextResponse.json({ ok: true, updated: result.count });
  }

  return NextResponse.json({ error: "Nothing to retry" }, { status: 400 });
}
