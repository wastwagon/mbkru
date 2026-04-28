import { describe, expect, it } from "vitest";

import {
  memberNotificationHref,
  memberNotificationLinkLabel,
  memberNotificationSummary,
} from "./notification-labels";

describe("notification-labels", () => {
  it("summarizes known types", () => {
    expect(memberNotificationSummary("community_join_approved", { communityName: "East" })).toContain("East");
    expect(memberNotificationSummary("community_post_published", {})).toContain("published");
    expect(memberNotificationSummary("community_thread_reply", { communityName: "East" })).toContain("replied");
    expect(memberNotificationSummary("community_verification_approved", { communityName: "East" })).toContain(
      "approved",
    );
    expect(memberNotificationSummary("unknown_type_xyz", {})).toBe("unknown_type_xyz");
  });

  it("summarizes identity verification updates", () => {
    expect(
      memberNotificationSummary("identity_verification_updated", {
        status: "VERIFIED",
        previousStatus: "PENDING_REVIEW",
      }),
    ).toContain("Verified");
    expect(
      memberNotificationSummary("identity_verification_updated", { status: "REJECTED" }),
    ).toContain("Could not verify");
  });

  it("builds community href from payload", () => {
    expect(memberNotificationHref("x", { communitySlug: "demo-area" })).toBe("/communities/demo-area");
    expect(memberNotificationHref("x", {})).toBeNull();
  });

  it("links thread reply notifications to the root post", () => {
    expect(
      memberNotificationHref("community_thread_reply", {
        communitySlug: "demo-area",
        threadPostId: "tid1",
      }),
    ).toBe("/communities/demo-area/post/tid1");
    expect(memberNotificationLinkLabel("community_thread_reply")).toBe("View thread");
  });

  it("links published and rejected post notifications to the permalink", () => {
    expect(
      memberNotificationHref("community_post_published", {
        communitySlug: "demo-area",
        postId: "pid1",
      }),
    ).toBe("/communities/demo-area/post/pid1");
    expect(
      memberNotificationHref("community_post_rejected", { communitySlug: "x", postId: "p2" }),
    ).toBe("/communities/x/post/p2");
    expect(memberNotificationLinkLabel("community_post_published")).toBe("View post");
    expect(memberNotificationLinkLabel("community_post_reported")).toBe("View post");
  });

  it("links reported post notifications for moderators to the post", () => {
    expect(
      memberNotificationHref("community_post_reported", {
        communitySlug: "demo-area",
        postId: "pid9",
        communityId: "cid1",
      }),
    ).toBe("/communities/demo-area/post/pid9");
  });

  it("links identity notifications to account", () => {
    expect(memberNotificationHref("identity_verification_updated", {})).toBe("/account");
    expect(memberNotificationLinkLabel("identity_verification_updated")).toBe("View account");
    expect(memberNotificationLinkLabel("community_join_approved")).toBe("Open community");
  });

  it("summarizes citizen report admin reply", () => {
    expect(
      memberNotificationSummary("citizen_report_admin_reply", { trackingCode: "ABC123" }),
    ).toContain("ABC123");
    expect(memberNotificationHref("citizen_report_admin_reply", { reportId: "rid1" })).toBe("/account/reports/rid1");
    expect(memberNotificationLinkLabel("citizen_report_admin_reply")).toBe("View report");
  });

  it("summarizes visible-again admin reply notification", () => {
    expect(
      memberNotificationSummary("citizen_report_admin_reply_visible_again", { trackingCode: "T1" }),
    ).toContain("visible again");
    expect(
      memberNotificationHref("citizen_report_admin_reply_visible_again", { reportId: "r2" }),
    ).toBe("/account/reports/r2");
  });
});
