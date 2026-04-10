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
