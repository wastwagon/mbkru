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
});
