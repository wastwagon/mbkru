import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const createMemberNotification = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const enqueueCommunityPostReportModeratorDelivery = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@/lib/server/member-notifications", () => ({
  createMemberNotification,
}));

vi.mock("@/lib/server/community-member-transactional-outbox", () => ({
  enqueueCommunityPostReportModeratorDelivery,
}));

const findMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    communityMembership: { findMany },
  },
}));

import { notifyCommunityModeratorsOfPostReport } from "./community-report-notify";

describe("notifyCommunityModeratorsOfPostReport", () => {
  beforeEach(() => {
    findMany.mockReset();
    createMemberNotification.mockReset();
    enqueueCommunityPostReportModeratorDelivery.mockReset();
  });

  it("notifies other moderators only and enqueues outbound delivery", async () => {
    findMany.mockResolvedValue([{ memberId: "mod-a" }, { memberId: "qm-b" }]);

    await notifyCommunityModeratorsOfPostReport({
      communityId: "c1",
      postId: "p1",
      reason: "SPAM",
      communitySlug: "east",
      communityName: "East",
      reporterMemberId: "reporter-1",
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        communityId: "c1",
        state: "ACTIVE",
        role: { in: ["MODERATOR", "QUEEN_MOTHER_VERIFIED"] },
        memberId: { not: "reporter-1" },
      },
      select: { memberId: true },
    });
    expect(createMemberNotification).toHaveBeenCalledTimes(2);
    expect(enqueueCommunityPostReportModeratorDelivery).toHaveBeenCalledWith({
      moderatorMemberIds: ["mod-a", "qm-b"],
      communityName: "East",
      communitySlug: "east",
      postId: "p1",
      reason: "SPAM",
    });
  });
});
