import { describe, expect, it } from "vitest";

import { canReadCommunityFullDetail, canReadCommunityPosts } from "./communities-gates";

describe("communities-gates", () => {
  it("PUBLIC communities: anyone can read posts and detail", () => {
    expect(canReadCommunityPosts("PUBLIC", null)).toBe(true);
    expect(canReadCommunityFullDetail("PUBLIC", null)).toBe(true);
  });

  it("MEMBERS_ONLY: only active members read posts/detail", () => {
    expect(canReadCommunityPosts("MEMBERS_ONLY", null)).toBe(false);
    expect(canReadCommunityFullDetail("MEMBERS_ONLY", null)).toBe(false);
    expect(canReadCommunityPosts("MEMBERS_ONLY", { state: "PENDING_JOIN" })).toBe(false);
    expect(canReadCommunityFullDetail("MEMBERS_ONLY", { state: "PENDING_JOIN" })).toBe(false);
    expect(canReadCommunityPosts("MEMBERS_ONLY", { state: "ACTIVE" })).toBe(true);
    expect(canReadCommunityFullDetail("MEMBERS_ONLY", { state: "ACTIVE" })).toBe(true);
  });
});
