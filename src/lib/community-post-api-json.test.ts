import { describe, expect, it } from "vitest";

import { toCommunityPostListApiJson } from "./community-post-api-json";

describe("toCommunityPostListApiJson", () => {
  const base = {
    id: "p1",
    kind: "GENERAL",
    title: "Hi",
    body: "Body",
    moderationStatus: "PUBLISHED",
    pinned: false,
    parentPostId: null as string | null,
    createdAt: new Date("2026-01-01T12:00:00.000Z"),
    lastActivityAt: new Date("2026-01-02T12:00:00.000Z"),
    author: { id: "m1", displayName: "Ama" },
    communityForum: { slug: "general", name: "General" },
    _count: { replies: 3 },
  };

  it("includes replyCount for root threads", () => {
    const j = toCommunityPostListApiJson(base);
    expect(j.replyCount).toBe(3);
    expect(j.lastActivityAt).toBe("2026-01-02T12:00:00.000Z");
    expect(j.forum?.slug).toBe("general");
  });

  it("omits replyCount for replies", () => {
    const j = toCommunityPostListApiJson({ ...base, parentPostId: "root1", _count: { replies: 0 } });
    expect(j.replyCount).toBeUndefined();
    expect(j.parentPostId).toBe("root1");
  });
});
