import { describe, expect, it } from "vitest";

import { canManageCommunityAffairs, communityMembershipRoleLabel } from "./community-affairs-roles";

describe("community-affairs-roles", () => {
  it("grants affairs powers to moderators and verified Queen Mothers only", () => {
    expect(canManageCommunityAffairs("QUEEN_MOTHER_VERIFIED")).toBe(true);
    expect(canManageCommunityAffairs("MODERATOR")).toBe(true);
    expect(canManageCommunityAffairs("MEMBER")).toBe(false);
  });

  it("labels Queen Mother role for UI", () => {
    expect(communityMembershipRoleLabel("QUEEN_MOTHER_VERIFIED")).toBe("Queen Mother (verified)");
  });
});
