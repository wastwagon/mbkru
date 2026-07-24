import "server-only";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export type AdminAttentionTone = "danger" | "warning" | "info";

export type AdminAttentionItem = {
  id: string;
  tone: AdminAttentionTone;
  title: string;
  detail: string;
  href: string;
  count: number;
  /** Lower = show first. */
  priority: number;
};

export type AdminHomeWeekDelta = {
  current: number;
  previous: number;
};

export type AdminHomeDayCount = {
  /** ISO date `YYYY-MM-DD` (UTC). */
  day: string;
  count: number;
};

export type AdminHomeSnapshot = {
  generatedAt: string;
  reportsTotal: number;
  reportsQueue: number;
  reportsSlaOverdue: number;
  reportsCreatedWeek: AdminHomeWeekDelta;
  /** Last 14 UTC days of citizen-report creates (for sparkline). */
  reportsDailyLast14: AdminHomeDayCount[];
  petitionsOpen: number;
  contactsWeek: AdminHomeWeekDelta;
  diasporaWeek: AdminHomeWeekDelta;
  leadsTotal: number;
  communityReportsOpen: number;
  communityPostsPending: number;
  verificationsPending: number;
  publicCauseDrafts: number;
  notificationsFailed: number;
  notificationsPending: number;
  attention: AdminAttentionItem[];
};

function emptySnapshot(): AdminHomeSnapshot {
  const zero = { current: 0, previous: 0 };
  return {
    generatedAt: new Date().toISOString(),
    reportsTotal: 0,
    reportsQueue: 0,
    reportsSlaOverdue: 0,
    reportsCreatedWeek: zero,
    reportsDailyLast14: [],
    petitionsOpen: 0,
    contactsWeek: zero,
    diasporaWeek: zero,
    leadsTotal: 0,
    communityReportsOpen: 0,
    communityPostsPending: 0,
    verificationsPending: 0,
    publicCauseDrafts: 0,
    notificationsFailed: 0,
    notificationsPending: 0,
    attention: [],
  };
}

function weekWindows(now = new Date()) {
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const priorWeekStart = new Date(now);
  priorWeekStart.setDate(priorWeekStart.getDate() - 14);
  const last14Start = new Date(now);
  last14Start.setUTCDate(last14Start.getUTCDate() - 13);
  last14Start.setUTCHours(0, 0, 0, 0);
  return { thisWeekStart, priorWeekStart, last14Start, now };
}

function fillDailySeries(
  since: Date,
  now: Date,
  rows: Array<{ day: Date; c: bigint | number }>,
): AdminHomeDayCount[] {
  const byDay = new Map<string, number>();
  for (const row of rows) {
    const d = row.day;
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    byDay.set(key, typeof row.c === "bigint" ? Number(row.c) : row.c);
  }
  const out: AdminHomeDayCount[] = [];
  const cursor = new Date(since);
  while (cursor.getTime() <= now.getTime()) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-${String(cursor.getUTCDate()).padStart(2, "0")}`;
    out.push({ day: key, count: byDay.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

function buildAttention(s: Omit<AdminHomeSnapshot, "attention" | "generatedAt">): AdminAttentionItem[] {
  const items: AdminAttentionItem[] = [];

  if (s.reportsSlaOverdue > 0) {
    items.push({
      id: "sla-overdue",
      tone: "danger",
      title: "SLA overdue reports",
      detail: `${s.reportsSlaOverdue} open report${s.reportsSlaOverdue === 1 ? "" : "s"} past due — triage first.`,
      href: "/admin/reports",
      count: s.reportsSlaOverdue,
      priority: 1,
    });
  }

  if (s.communityReportsOpen > 0) {
    items.push({
      id: "community-reports",
      tone: "danger",
      title: "Open community post reports",
      detail: "Member-flagged posts waiting for staff review.",
      href: "/admin/community-reports",
      count: s.communityReportsOpen,
      priority: 2,
    });
  }

  if (s.notificationsFailed > 0) {
    items.push({
      id: "notifications-failed",
      tone: "warning",
      title: "Failed notification jobs",
      detail: "Retry or inspect delivery errors in the outbox.",
      href: "/admin/notifications",
      count: s.notificationsFailed,
      priority: 3,
    });
  }

  if (s.communityPostsPending > 0) {
    items.push({
      id: "community-posts",
      tone: "warning",
      title: "Pending community posts",
      detail: "Global moderation queue — publish or reject.",
      href: "/admin/communities/moderation",
      count: s.communityPostsPending,
      priority: 4,
    });
  }

  if (s.verificationsPending > 0) {
    items.push({
      id: "verifications",
      tone: "warning",
      title: "Verification requests",
      detail: "Identity / traditional-role reviews submitted by members.",
      href: "/admin/community-verifications",
      count: s.verificationsPending,
      priority: 5,
    });
  }

  if (s.reportsQueue > 0) {
    items.push({
      id: "reports-queue",
      tone: "info",
      title: "Citizen reports in queue",
      detail: "Received or under review — open the triage list.",
      href: "/admin/reports",
      count: s.reportsQueue,
      priority: 6,
    });
  }

  if (s.publicCauseDrafts > 0) {
    items.push({
      id: "public-cause-drafts",
      tone: "info",
      title: "Public cause drafts",
      detail: "Slug assigned but thread not opened yet.",
      href: "/admin/public-causes?view=draft",
      count: s.publicCauseDrafts,
      priority: 7,
    });
  }

  if (s.notificationsPending > 0 && s.notificationsFailed === 0) {
    items.push({
      id: "notifications-pending",
      tone: "info",
      title: "Notification jobs pending",
      detail: "Outbox has work waiting — run the processor if deliveries stall.",
      href: "/admin/notifications",
      count: s.notificationsPending,
      priority: 8,
    });
  }

  return items.sort((a, b) => a.priority - b.priority || b.count - a.count);
}

/** Queue counts, week deltas, and prioritized attention items for `/admin`. */
export async function getAdminHomeSnapshot(): Promise<AdminHomeSnapshot> {
  if (!isDatabaseConfigured()) return emptySnapshot();

  const { thisWeekStart, priorWeekStart, last14Start, now } = weekWindows();

  const [
    reportsTotal,
    reportsQueue,
    reportsSlaOverdue,
    reportsThisWeek,
    reportsPriorWeek,
    reportsDailyRows,
    petitionsOpen,
    contactsThisWeek,
    contactsPriorWeek,
    diasporaThisWeek,
    diasporaPriorWeek,
    leadsTotal,
    communityReportsOpen,
    communityPostsPending,
    verificationsPending,
    publicCauseDrafts,
    notificationsFailed,
    notificationsPending,
  ] = await Promise.all([
    prisma.citizenReport.count(),
    prisma.citizenReport.count({
      where: { status: { in: ["RECEIVED", "UNDER_REVIEW"] } },
    }),
    prisma.citizenReport.count({
      where: {
        slaDueAt: { lt: now },
        status: { in: ["RECEIVED", "UNDER_REVIEW", "ESCALATED"] },
      },
    }),
    prisma.citizenReport.count({ where: { createdAt: { gte: thisWeekStart } } }),
    prisma.citizenReport.count({
      where: { createdAt: { gte: priorWeekStart, lt: thisWeekStart } },
    }),
    prisma.$queryRaw<Array<{ day: Date; c: bigint }>>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::bigint AS c
      FROM "CitizenReport"
      WHERE "createdAt" >= ${last14Start}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
    prisma.petition.count({ where: { status: "OPEN" } }),
    prisma.contactSubmission.count({ where: { createdAt: { gte: thisWeekStart } } }),
    prisma.contactSubmission.count({
      where: { createdAt: { gte: priorWeekStart, lt: thisWeekStart } },
    }),
    prisma.diasporaFeedbackSubmission.count({ where: { createdAt: { gte: thisWeekStart } } }),
    prisma.diasporaFeedbackSubmission.count({
      where: { createdAt: { gte: priorWeekStart, lt: thisWeekStart } },
    }),
    prisma.leadCapture.count(),
    prisma.communityPostReport.count({ where: { status: "OPEN" } }),
    prisma.communityPost.count({ where: { moderationStatus: "PENDING" } }),
    prisma.communityVerificationRequest.count({ where: { status: "SUBMITTED" } }),
    prisma.citizenReport.count({
      where: {
        publicCauseSlug: { not: null },
        publicCauseOpenedAt: null,
      },
    }),
    prisma.notificationDeliveryJob.count({ where: { status: "FAILED" } }),
    prisma.notificationDeliveryJob.count({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
    }),
  ]);

  const reportsDailyLast14 = fillDailySeries(last14Start, now, reportsDailyRows);

  const base = {
    reportsTotal,
    reportsQueue,
    reportsSlaOverdue,
    reportsCreatedWeek: { current: reportsThisWeek, previous: reportsPriorWeek },
    reportsDailyLast14,
    petitionsOpen,
    contactsWeek: { current: contactsThisWeek, previous: contactsPriorWeek },
    diasporaWeek: { current: diasporaThisWeek, previous: diasporaPriorWeek },
    leadsTotal,
    communityReportsOpen,
    communityPostsPending,
    verificationsPending,
    publicCauseDrafts,
    notificationsFailed,
    notificationsPending,
  };

  return {
    ...base,
    generatedAt: now.toISOString(),
    attention: buildAttention(base),
  };
}

/** Format week-over-week count delta for badges. */
export function formatWeekDelta(delta: AdminHomeWeekDelta): {
  text: string;
  tone: "success" | "warning" | "danger" | "info" | "neutral";
} {
  const d = delta.current - delta.previous;
  if (d === 0) return { text: "±0 vs prior week", tone: "neutral" };
  if (d > 0) return { text: `+${d} vs prior week`, tone: "info" };
  return { text: `${d} vs prior week`, tone: "neutral" };
}
