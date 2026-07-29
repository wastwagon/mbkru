import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildAdminAttentionItems,
  fillAdminHomeDailySeries,
  formatWeekDelta,
  type AdminHomeSnapshot,
} from "@/lib/server/admin-home-attention";

function snapshotBase(
  overrides: Partial<Omit<AdminHomeSnapshot, "attention" | "generatedAt">> = {},
): Omit<AdminHomeSnapshot, "attention" | "generatedAt"> {
  const zero = { current: 0, previous: 0 };
  return {
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
    ...overrides,
  };
}

describe("formatWeekDelta", () => {
  it("labels flat weeks", () => {
    expect(formatWeekDelta({ current: 3, previous: 3 })).toEqual({
      text: "±0 vs prior week",
      tone: "neutral",
    });
  });

  it("labels increases and decreases", () => {
    expect(formatWeekDelta({ current: 5, previous: 2 }).text).toBe("+3 vs prior week");
    expect(formatWeekDelta({ current: 1, previous: 4 }).text).toBe("-3 vs prior week");
  });
});

describe("fillAdminHomeDailySeries", () => {
  it("fills missing days with zeros", () => {
    const since = new Date(Date.UTC(2026, 6, 1));
    const now = new Date(Date.UTC(2026, 6, 3, 12, 0, 0));
    const series = fillAdminHomeDailySeries(since, now, [
      { day: new Date(Date.UTC(2026, 6, 1)), c: 2 },
      { day: new Date(Date.UTC(2026, 6, 3)), c: BigInt(5) },
    ]);
    expect(series).toEqual([
      { day: "2026-07-01", count: 2 },
      { day: "2026-07-02", count: 0 },
      { day: "2026-07-03", count: 5 },
    ]);
  });
});

describe("buildAdminAttentionItems", () => {
  it("returns empty when queues are clear", () => {
    expect(buildAdminAttentionItems(snapshotBase())).toEqual([]);
  });

  it("prioritizes SLA ahead of report queue", () => {
    const items = buildAdminAttentionItems(
      snapshotBase({ reportsSlaOverdue: 2, reportsQueue: 9 }),
    );
    expect(items[0]?.id).toBe("sla-overdue");
    expect(items.some((i) => i.id === "reports-queue")).toBe(true);
  });

  it("includes community and notification alerts", () => {
    const items = buildAdminAttentionItems(
      snapshotBase({
        communityReportsOpen: 1,
        notificationsFailed: 3,
        communityPostsPending: 2,
        verificationsPending: 4,
        publicCauseDrafts: 1,
      }),
    );
    expect(items.map((i) => i.id)).toEqual([
      "community-reports",
      "notifications-failed",
      "community-posts",
      "verifications",
      "public-cause-drafts",
    ]);
  });
});
