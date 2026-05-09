"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseUtcDatetimeLocalInput } from "@/lib/admin/report-operations-datetime";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { logCitizenReportAdminReplyAudit } from "@/lib/server/citizen-report-admin-reply-audit";
import { createMemberNotification } from "@/lib/server/member-notifications";
import { enqueueNotificationJob, processNotificationOutboxBatch } from "@/lib/server/notification-outbox";
import {
  adminReplyToSubmitterField,
  operationsPlaybookKeyField,
  staffNotesField,
} from "@/lib/validation/admin-reports";
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
      await enqueueNotificationJob({
        channel: "EMAIL",
        kind: "REPORT_STATUS",
        payload: {
          to,
          trackingCode: prev.trackingCode,
          kind: prev.kind,
          status: newStatus,
        },
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
      await enqueueNotificationJob({
        channel: "SMS",
        kind: "REPORT_STATUS",
        payload: {
          to: smsTo,
          trackingCode: prev.trackingCode,
          kind: prev.kind,
          status: newStatus,
        },
      });
    }
    await processNotificationOutboxBatch(10);
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

export async function addCitizenReportAdminReplyAction(formData: FormData) {
  const adminSession = await requireAdminSession();

  const id = formData.get("reportId");
  if (typeof id !== "string" || !id) {
    redirect("/admin/reports?error=invalid");
  }

  const bodyParsed = adminReplyToSubmitterField.safeParse(formData.get("body"));
  if (!bodyParsed.success) {
    redirect(`/admin/reports/${id}?error=reply_invalid`);
  }

  const sendEmail = formData.get("notifyEmail") === "on";
  const sendSms = formData.get("notifySms") === "on";

  const report = await prisma.citizenReport.findUnique({
    where: { id },
    select: {
      id: true,
      trackingCode: true,
      kind: true,
      memberId: true,
      submitterEmail: true,
      submitterPhone: true,
      member: { select: { email: true, phone: true } },
    },
  });
  if (!report) {
    redirect("/admin/reports?error=notfound");
  }

  const created = await prisma.citizenReportAdminReply.create({
    data: {
      reportId: report.id,
      adminId: adminSession.adminId,
      body: bodyParsed.data,
    },
    select: { id: true },
  });

  await logCitizenReportAdminReplyAudit({
    replyId: created.id,
    reportId: report.id,
    adminId: adminSession.adminId,
    action: "REPLY_POSTED",
    details: { visibleToSubmitter: true },
  });

  if (report.memberId) {
    await createMemberNotification(report.memberId, "citizen_report_admin_reply", {
      trackingCode: report.trackingCode,
      reportId: report.id,
    });
  }

  if (sendEmail) {
    const to = report.submitterEmail ?? report.member?.email;
    if (to) {
      await enqueueNotificationJob({
        channel: "EMAIL",
        kind: "REPORT_ADMIN_REPLY",
        payload: {
          to,
          trackingCode: report.trackingCode,
          kind: report.kind,
          replyBody: bodyParsed.data,
          isUpdate: false,
        },
      });
    }
  }

  if (sendSms) {
    const memberPhone = report.member?.phone?.trim();
    const submitterPhone = report.submitterPhone?.trim();
    const smsTo = memberPhone?.startsWith("+")
      ? memberPhone
      : submitterPhone?.startsWith("+")
        ? submitterPhone
        : undefined;
    if (smsTo) {
      await enqueueNotificationJob({
        channel: "SMS",
        kind: "REPORT_ADMIN_REPLY",
        payload: {
          to: smsTo,
          trackingCode: report.trackingCode,
          kind: report.kind,
          isUpdate: false,
        },
      });
    }
  }
  await processNotificationOutboxBatch(10);

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${id}`);
  revalidatePath("/account/reports");
  revalidatePath(`/account/reports/${id}`);
  redirect(`/admin/reports/${id}?saved=reply`);
}

export async function updateCitizenReportAdminReplyAction(formData: FormData) {
  const adminSession = await requireAdminSession();

  const reportId = formData.get("reportId");
  const replyId = formData.get("replyId");
  if (typeof reportId !== "string" || !reportId || typeof replyId !== "string" || !replyId) {
    redirect("/admin/reports?error=invalid");
  }

  const bodyParsed = adminReplyToSubmitterField.safeParse(formData.get("body"));
  if (!bodyParsed.success) {
    redirect(`/admin/reports/${reportId}?error=reply_invalid`);
  }

  const sendEmail = formData.get("notifyEmail") === "on";
  const sendSms = formData.get("notifySms") === "on";

  const row = await prisma.citizenReportAdminReply.findFirst({
    where: { id: replyId, reportId },
    select: { id: true },
  });
  if (!row) {
    redirect("/admin/reports?error=notfound");
  }

  await prisma.citizenReportAdminReply.update({
    where: { id: replyId },
    data: { body: bodyParsed.data, editedByAdminId: adminSession.adminId },
  });

  await logCitizenReportAdminReplyAudit({
    replyId,
    reportId,
    adminId: adminSession.adminId,
    action: "REPLY_EDITED",
    details: { bodyLength: bodyParsed.data.length },
  });

  if (sendEmail || sendSms) {
    const report = await prisma.citizenReport.findUnique({
      where: { id: reportId },
      select: {
        trackingCode: true,
        kind: true,
        submitterEmail: true,
        submitterPhone: true,
        member: { select: { email: true, phone: true } },
      },
    });
    if (report) {
      if (sendEmail) {
        const to = report.submitterEmail ?? report.member?.email;
        if (to) {
          await enqueueNotificationJob({
            channel: "EMAIL",
            kind: "REPORT_ADMIN_REPLY",
            payload: {
              to,
              trackingCode: report.trackingCode,
              kind: report.kind,
              replyBody: bodyParsed.data,
              isUpdate: true,
            },
          });
        }
      }
      if (sendSms) {
        const memberPhone = report.member?.phone?.trim();
        const submitterPhone = report.submitterPhone?.trim();
        const smsTo = memberPhone?.startsWith("+")
          ? memberPhone
          : submitterPhone?.startsWith("+")
            ? submitterPhone
            : undefined;
        if (smsTo) {
          await enqueueNotificationJob({
            channel: "SMS",
            kind: "REPORT_ADMIN_REPLY",
            payload: {
              to: smsTo,
              trackingCode: report.trackingCode,
              kind: report.kind,
              isUpdate: true,
            },
          });
        }
      }
      await processNotificationOutboxBatch(10);
    }
  }

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${reportId}`);
  revalidatePath("/account/reports");
  revalidatePath(`/account/reports/${reportId}`);
  redirect(`/admin/reports/${reportId}?saved=reply_edit`);
}

export async function setCitizenReportAdminReplyVisibilityAction(formData: FormData) {
  const adminSession = await requireAdminSession();

  const reportId = formData.get("reportId");
  const replyId = formData.get("replyId");
  const visibleRaw = formData.get("visible");
  if (typeof reportId !== "string" || !reportId || typeof replyId !== "string" || !replyId) {
    redirect("/admin/reports?error=invalid");
  }
  if (visibleRaw !== "0" && visibleRaw !== "1") {
    redirect(`/admin/reports/${reportId}?error=invalid`);
  }
  const visibleToSubmitter = visibleRaw === "1";
  const notifyUnhideEmail = formData.get("notifyUnhideEmail") === "on";
  const notifyUnhideSms = formData.get("notifyUnhideSms") === "on";

  const row = await prisma.citizenReportAdminReply.findFirst({
    where: { id: replyId, reportId },
    select: { id: true, visibleToSubmitter: true },
  });
  if (!row) {
    redirect("/admin/reports?error=notfound");
  }

  const wasVisible = row.visibleToSubmitter;

  await prisma.citizenReportAdminReply.update({
    where: { id: replyId },
    data: { visibleToSubmitter },
  });

  await logCitizenReportAdminReplyAudit({
    replyId,
    reportId,
    adminId: adminSession.adminId,
    action: "REPLY_VISIBILITY",
    details: { from: wasVisible, to: visibleToSubmitter },
  });

  if (visibleToSubmitter && !wasVisible) {
    const report = await prisma.citizenReport.findUnique({
      where: { id: reportId },
      select: {
        memberId: true,
        trackingCode: true,
        kind: true,
        submitterEmail: true,
        submitterPhone: true,
        member: { select: { email: true, phone: true } },
      },
    });
    if (report?.memberId) {
      await createMemberNotification(report.memberId, "citizen_report_admin_reply_visible_again", {
        trackingCode: report.trackingCode,
        reportId,
      });
    }

    if (notifyUnhideEmail && report) {
      const to = report.submitterEmail ?? report.member?.email;
      if (to) {
        await enqueueNotificationJob({
          channel: "EMAIL",
          kind: "REPORT_ADMIN_REPLY_VISIBLE_AGAIN",
          payload: {
            to,
            trackingCode: report.trackingCode,
            kind: report.kind,
          },
        });
      }
    }

    if (notifyUnhideSms && report) {
      const memberPhone = report.member?.phone?.trim();
      const submitterPhone = report.submitterPhone?.trim();
      const smsTo = memberPhone?.startsWith("+")
        ? memberPhone
        : submitterPhone?.startsWith("+")
          ? submitterPhone
          : undefined;
      if (smsTo) {
        await enqueueNotificationJob({
          channel: "SMS",
          kind: "REPORT_ADMIN_REPLY_VISIBLE_AGAIN",
          payload: {
            to: smsTo,
            trackingCode: report.trackingCode,
            kind: report.kind,
          },
        });
      }
    }
    await processNotificationOutboxBatch(10);
  }

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${reportId}`);
  revalidatePath("/account/reports");
  revalidatePath(`/account/reports/${reportId}`);
  redirect(`/admin/reports/${reportId}?saved=reply_visibility`);
}

export async function updateCitizenReportDiscussionEnabledAction(formData: FormData) {
  await requireAdminSession();

  const id = formData.get("id");
  const raw = formData.get("discussionEnabled");
  if (typeof id !== "string" || !id) {
    redirect("/admin/reports?error=invalid");
  }
  if (typeof raw !== "string" || (raw !== "true" && raw !== "false")) {
    redirect(`/admin/reports/${id}?error=discussion_invalid`);
  }

  const discussionEnabled = raw === "true";

  const prev = await prisma.citizenReport.findUnique({ where: { id }, select: { id: true } });
  if (!prev) {
    redirect("/admin/reports?error=notfound");
  }

  await prisma.citizenReport.update({
    where: { id },
    data: { discussionEnabled },
  });

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/reports/${id}`);
  revalidatePath("/report-card");
  revalidatePath(`/citizens-voice/discussions/${id}`);
  redirect(`/admin/reports/${id}?saved=discussion`);
}
