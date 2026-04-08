"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseUtcDatetimeLocalInput } from "@/lib/admin/report-operations-datetime";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { sendReportStatusNotification } from "@/lib/server/send-report-status-email";
import { sendReportStatusSms } from "@/lib/server/send-report-status-sms";
import { operationsPlaybookKeyField, staffNotesField } from "@/lib/validation/admin-reports";
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
    include: { member: { select: { email: true, phone: true } } },
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

    const memberPhone = prev.member?.phone?.trim();
    const submitterPhone = prev.submitterPhone?.trim();
    const smsTo = memberPhone?.startsWith("+")
      ? memberPhone
      : submitterPhone?.startsWith("+")
        ? submitterPhone
        : undefined;
    if (smsTo) {
      await sendReportStatusSms({
        to: smsTo,
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

export async function updateCitizenReportOperationsAction(formData: FormData) {
  await requireAdminSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    redirect("/admin/reports?error=invalid");
  }

  const slaRaw = formData.get("slaDueAt");
  const playbookRaw = formData.get("operationsPlaybookKey");
  const notesRaw = formData.get("staffNotes");

  let slaDueAt: Date | null;
  if (slaRaw === null) {
    slaDueAt = null;
  } else if (typeof slaRaw === "string") {
    const trimmed = slaRaw.trim();
    if (!trimmed) {
      slaDueAt = null;
    } else {
      const d = parseUtcDatetimeLocalInput(trimmed);
      if (!d) {
        redirect(`/admin/reports/${id}?error=sla_invalid`);
      }
      slaDueAt = d;
    }
  } else {
    redirect(`/admin/reports/${id}?error=invalid`);
  }

  const playbookParsed = operationsPlaybookKeyField.safeParse(
    typeof playbookRaw === "string" ? playbookRaw : undefined,
  );
  if (!playbookParsed.success) {
    redirect(`/admin/reports/${id}?error=invalid`);
  }

  const notesParsed = staffNotesField.safeParse(typeof notesRaw === "string" ? notesRaw : undefined);
  if (!notesParsed.success) {
    redirect(`/admin/reports/${id}?error=invalid`);
  }

  const exists = await prisma.citizenReport.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    redirect("/admin/reports?error=notfound");
  }

  await prisma.citizenReport.update({
    where: { id },
    data: {
      slaDueAt,
      operationsPlaybookKey: playbookParsed.data ?? null,
      staffNotes: notesParsed.data ?? null,
    },
  });

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${id}`);
  redirect(`/admin/reports/${id}?saved=ops`);
}
