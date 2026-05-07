import "server-only";

import { prisma } from "@/lib/db/prisma";
import { sendReportAdminReplyEmail, sendReportAdminReplyVisibleAgainEmail } from "@/lib/server/send-report-admin-reply-email";
import { sendReportStatusNotification } from "@/lib/server/send-report-status-email";
import {
  sendReportAdminReplySms,
  sendReportAdminReplyVisibleAgainSms,
  sendReportStatusSms,
} from "@/lib/server/send-report-status-sms";

import type { CitizenReportKind, CitizenReportStatus, NotificationDeliveryChannel, NotificationDeliveryKind } from "@prisma/client";
import { Prisma } from "@prisma/client";

type EnqueueInput = {
  channel: NotificationDeliveryChannel;
  kind: NotificationDeliveryKind;
  payload: Record<string, unknown>;
  maxAttempts?: number;
};

export async function enqueueNotificationJob(input: EnqueueInput): Promise<void> {
  await prisma.notificationDeliveryJob.create({
    data: {
      channel: input.channel,
      kind: input.kind,
      payload: input.payload as Prisma.InputJsonValue,
      maxAttempts: input.maxAttempts && input.maxAttempts > 0 ? Math.min(input.maxAttempts, 10) : 5,
    },
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

async function deliverJob(job: {
  channel: NotificationDeliveryChannel;
  kind: NotificationDeliveryKind;
  payload: unknown;
}): Promise<{ ok: boolean; detail?: string }> {
  const payload = asRecord(job.payload);
  if (!payload) return { ok: false, detail: "invalid_payload" };

  if (job.channel === "EMAIL" && job.kind === "REPORT_STATUS") {
    const to = asString(payload.to);
    const trackingCode = asString(payload.trackingCode);
    const kind = asString(payload.kind) as CitizenReportKind | null;
    const status = asString(payload.status) as CitizenReportStatus | null;
    if (!to || !trackingCode || !kind || !status) return { ok: false, detail: "invalid_payload_fields" };
    const result = await sendReportStatusNotification({ to, trackingCode, kind, status });
    return { ok: result.mode === "sent" || result.mode === "skipped", detail: result.detail };
  }

  if (job.channel === "SMS" && job.kind === "REPORT_STATUS") {
    const to = asString(payload.to);
    const trackingCode = asString(payload.trackingCode);
    const kind = asString(payload.kind) as CitizenReportKind | null;
    const status = asString(payload.status) as CitizenReportStatus | null;
    if (!to || !trackingCode || !kind || !status) return { ok: false, detail: "invalid_payload_fields" };
    const result = await sendReportStatusSms({ to, trackingCode, kind, status });
    return { ok: result.mode === "sent" || result.mode === "skipped", detail: result.detail };
  }

  if (job.channel === "EMAIL" && job.kind === "REPORT_ADMIN_REPLY") {
    const to = asString(payload.to);
    const trackingCode = asString(payload.trackingCode);
    const kind = asString(payload.kind) as CitizenReportKind | null;
    const replyBody = asString(payload.replyBody);
    const isUpdate = payload.isUpdate === true;
    if (!to || !trackingCode || !kind || !replyBody) return { ok: false, detail: "invalid_payload_fields" };
    const result = await sendReportAdminReplyEmail({ to, trackingCode, kind, replyBody, isUpdate });
    return { ok: result.mode === "sent" || result.mode === "skipped", detail: result.detail };
  }

  if (job.channel === "SMS" && job.kind === "REPORT_ADMIN_REPLY") {
    const to = asString(payload.to);
    const trackingCode = asString(payload.trackingCode);
    const kind = asString(payload.kind) as CitizenReportKind | null;
    const isUpdate = payload.isUpdate === true;
    if (!to || !trackingCode || !kind) return { ok: false, detail: "invalid_payload_fields" };
    const result = await sendReportAdminReplySms({ to, trackingCode, kind, isUpdate });
    return { ok: result.mode === "sent" || result.mode === "skipped", detail: result.detail };
  }

  if (job.channel === "EMAIL" && job.kind === "REPORT_ADMIN_REPLY_VISIBLE_AGAIN") {
    const to = asString(payload.to);
    const trackingCode = asString(payload.trackingCode);
    const kind = asString(payload.kind) as CitizenReportKind | null;
    if (!to || !trackingCode || !kind) return { ok: false, detail: "invalid_payload_fields" };
    const result = await sendReportAdminReplyVisibleAgainEmail({ to, trackingCode, kind });
    return { ok: result.mode === "sent" || result.mode === "skipped", detail: result.detail };
  }

  if (job.channel === "SMS" && job.kind === "REPORT_ADMIN_REPLY_VISIBLE_AGAIN") {
    const to = asString(payload.to);
    const trackingCode = asString(payload.trackingCode);
    const kind = asString(payload.kind) as CitizenReportKind | null;
    if (!to || !trackingCode || !kind) return { ok: false, detail: "invalid_payload_fields" };
    const result = await sendReportAdminReplyVisibleAgainSms({ to, trackingCode, kind });
    return { ok: result.mode === "sent" || result.mode === "skipped", detail: result.detail };
  }

  return { ok: false, detail: "unsupported_notification_job" };
}

export async function processNotificationOutboxBatch(limit = 20): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const now = new Date();
  const jobs = await prisma.notificationDeliveryJob.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      availableAt: { lte: now },
    },
    orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
    take: Math.max(1, Math.min(limit, 100)),
  });

  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    if (job.attempts >= job.maxAttempts) continue;
    const locked = await prisma.notificationDeliveryJob.updateMany({
      where: { id: job.id, status: { in: ["PENDING", "FAILED"] } },
      data: { status: "PROCESSING", attempts: { increment: 1 } },
    });
    if (locked.count === 0) continue;

    try {
      const result = await deliverJob(job);
      if (result.ok) {
        sent += 1;
        await prisma.notificationDeliveryJob.update({
          where: { id: job.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            lastError: result.detail ? String(result.detail).slice(0, 500) : null,
          },
        });
      } else {
        failed += 1;
        const tooManyAttempts = job.attempts + 1 >= job.maxAttempts;
        await prisma.notificationDeliveryJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            lastError: (result.detail ?? "delivery_failed").slice(0, 1000),
            availableAt: tooManyAttempts ? now : new Date(Date.now() + (job.attempts + 1) * 60_000),
          },
        });
      }
    } catch (err) {
      failed += 1;
      const tooManyAttempts = job.attempts + 1 >= job.maxAttempts;
      await prisma.notificationDeliveryJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          lastError: (err instanceof Error ? err.message : "unexpected_error").slice(0, 1000),
          availableAt: tooManyAttempts ? now : new Date(Date.now() + (job.attempts + 1) * 60_000),
        },
      });
    }
  }

  return { processed: jobs.length, sent, failed };
}
