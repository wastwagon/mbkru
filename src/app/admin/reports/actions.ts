"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { sendReportStatusNotification } from "@/lib/server/send-report-status-email";
import type { CitizenReportStatus } from "@prisma/client";

const STATUSES: CitizenReportStatus[] = [
  "RECEIVED",
  "UNDER_REVIEW",
  "ESCALATED",
  "CLOSED",
  "ARCHIVED",
];

export async function updateCitizenReportStatusAction(formData: FormData) {
  await requireAdminSession();

  const id = formData.get("id");
  const statusRaw = formData.get("status");
  if (typeof id !== "string" || !id) {
    redirect("/admin/reports?error=invalid");
  }
  if (typeof statusRaw !== "string" || !STATUSES.includes(statusRaw as CitizenReportStatus)) {
    redirect("/admin/reports?error=invalid");
  }
  const newStatus = statusRaw as CitizenReportStatus;

  const prev = await prisma.citizenReport.findUnique({
    where: { id },
    include: { member: { select: { email: true } } },
  });
  if (!prev) {
    redirect("/admin/reports?error=notfound");
  }

  await prisma.citizenReport.update({
    where: { id },
    data: { status: newStatus },
  });

  if (prev.status !== newStatus) {
    const to = prev.submitterEmail ?? prev.member?.email;
    if (to) {
      await sendReportStatusNotification({
        to,
        trackingCode: prev.trackingCode,
        kind: prev.kind,
        status: newStatus,
      });
    }
  }

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${id}`);
  redirect(`/admin/reports/${id}`);
}
