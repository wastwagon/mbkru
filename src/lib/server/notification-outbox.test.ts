import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    notificationDeliveryJob: {
      create: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
  };
  return { mockPrisma };
});

vi.mock("@/lib/db/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/server/send-report-status-email", () => ({
  sendReportStatusNotification: vi.fn(),
}));

vi.mock("@/lib/server/send-report-status-sms", () => ({
  sendReportStatusSms: vi.fn(),
  sendReportAdminReplySms: vi.fn(),
  sendReportAdminReplyVisibleAgainSms: vi.fn(),
  sendTransactionalSmsRaw: vi.fn(),
}));

vi.mock("@/lib/server/send-report-admin-reply-email", () => ({
  sendReportAdminReplyEmail: vi.fn(),
  sendReportAdminReplyVisibleAgainEmail: vi.fn(),
}));

vi.mock("@/lib/server/send-member-transactional-email", () => ({
  sendMemberTransactionalEmail: vi.fn(),
}));

import { sendMemberTransactionalEmail } from "@/lib/server/send-member-transactional-email";
import { sendReportStatusNotification } from "@/lib/server/send-report-status-email";
import { sendTransactionalSmsRaw } from "@/lib/server/send-report-status-sms";
import { enqueueNotificationJob, processNotificationOutboxBatch } from "@/lib/server/notification-outbox";

describe("notification outbox", () => {
  beforeEach(() => {
    mockPrisma.notificationDeliveryJob.create.mockReset();
    mockPrisma.notificationDeliveryJob.findMany.mockReset();
    mockPrisma.notificationDeliveryJob.updateMany.mockReset();
    mockPrisma.notificationDeliveryJob.update.mockReset();
    vi.mocked(sendReportStatusNotification).mockReset();
    vi.mocked(sendMemberTransactionalEmail).mockReset();
    vi.mocked(sendTransactionalSmsRaw).mockReset();
  });

  it("enqueues notification jobs", async () => {
    await enqueueNotificationJob({
      channel: "EMAIL",
      kind: "REPORT_STATUS",
      payload: {
        to: "person@example.com",
        trackingCode: "ABC123",
        kind: "VOICE",
        status: "RECEIVED",
      },
    });
    expect(mockPrisma.notificationDeliveryJob.create).toHaveBeenCalledTimes(1);
  });

  it("processes pending job and marks it sent", async () => {
    mockPrisma.notificationDeliveryJob.findMany.mockResolvedValue([
      {
        id: "cjld2cjxh0000qzrmn831i7ra",
        channel: "EMAIL",
        kind: "REPORT_STATUS",
        payload: { to: "p@example.com", trackingCode: "ABC123", kind: "VOICE", status: "RECEIVED" },
        status: "PENDING",
        attempts: 0,
        maxAttempts: 5,
        availableAt: new Date(),
        createdAt: new Date(),
      },
    ]);
    mockPrisma.notificationDeliveryJob.updateMany.mockResolvedValue({ count: 1 });
    vi.mocked(sendReportStatusNotification).mockResolvedValue({ mode: "sent" });

    const result = await processNotificationOutboxBatch(10);

    expect(result.processed).toBe(1);
    expect(result.sent).toBe(1);
    expect(result.failed).toBe(0);
    expect(mockPrisma.notificationDeliveryJob.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "SENT" }) }),
    );
  });

  it("marks invalid payload job as failed", async () => {
    mockPrisma.notificationDeliveryJob.findMany.mockResolvedValue([
      {
        id: "cjld2cjxh0000qzrmn831i7rb",
        channel: "EMAIL",
        kind: "REPORT_STATUS",
        payload: { to: "p@example.com" },
        status: "PENDING",
        attempts: 0,
        maxAttempts: 2,
        availableAt: new Date(),
        createdAt: new Date(),
      },
    ]);
    mockPrisma.notificationDeliveryJob.updateMany.mockResolvedValue({ count: 1 });

    const result = await processNotificationOutboxBatch(10);

    expect(result.processed).toBe(1);
    expect(result.sent).toBe(0);
    expect(result.failed).toBe(1);
    expect(mockPrisma.notificationDeliveryJob.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "FAILED" }) }),
    );
  });

  it("processes MEMBER_TRANSACTIONAL_EMAIL job", async () => {
    mockPrisma.notificationDeliveryJob.findMany.mockResolvedValue([
      {
        id: "job-email-1",
        channel: "EMAIL",
        kind: "MEMBER_TRANSACTIONAL_EMAIL",
        payload: { to: "m@example.com", subject: "Hi", text: "Body", tag: "community_join_approved" },
        status: "PENDING",
        attempts: 0,
        maxAttempts: 5,
        availableAt: new Date(),
        createdAt: new Date(),
      },
    ]);
    mockPrisma.notificationDeliveryJob.updateMany.mockResolvedValue({ count: 1 });
    vi.mocked(sendMemberTransactionalEmail).mockResolvedValue({ mode: "sent" });

    const result = await processNotificationOutboxBatch(10);

    expect(result.sent).toBe(1);
    expect(sendMemberTransactionalEmail).toHaveBeenCalledWith({
      to: "m@example.com",
      subject: "Hi",
      text: "Body",
    });
  });

  it("processes MEMBER_TRANSACTIONAL_SMS job", async () => {
    mockPrisma.notificationDeliveryJob.findMany.mockResolvedValue([
      {
        id: "job-sms-1",
        channel: "SMS",
        kind: "MEMBER_TRANSACTIONAL_SMS",
        payload: { to: "+233201111111", body: "Ping", tag: "community_thread_reply" },
        status: "PENDING",
        attempts: 0,
        maxAttempts: 5,
        availableAt: new Date(),
        createdAt: new Date(),
      },
    ]);
    mockPrisma.notificationDeliveryJob.updateMany.mockResolvedValue({ count: 1 });
    vi.mocked(sendTransactionalSmsRaw).mockResolvedValue({ mode: "sent" });

    const result = await processNotificationOutboxBatch(10);

    expect(result.sent).toBe(1);
    expect(sendTransactionalSmsRaw).toHaveBeenCalledWith({
      to: "+233201111111",
      body: "Ping",
      logPrefix: "community_thread_reply",
    });
  });
});
