import { beforeEach, describe, expect, it, vi } from "vitest";

const platformPhase = { value: 2 as 1 | 2 | 3 };

vi.mock("server-only", () => ({}));

vi.mock("@/config/platform", () => ({
  getServerPlatformPhase: () => platformPhase.value,
  platformFeatures: {
    communities: (p: number) => p >= 2,
  },
}));

vi.mock("@/lib/member/auth-api-guard", () => ({
  guardMemberAuthApi: vi.fn(),
}));

const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    communityMembership: { findUnique: vi.fn() },
    communityPost: { findFirst: vi.fn(), create: vi.fn() },
    communityForum: { findFirst: vi.fn() },
  };
  return { mockPrisma };
});

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: vi.fn(),
  prisma: mockPrisma,
}));

vi.mock("@/lib/member/session", () => ({
  getMemberSession: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn(),
}));

vi.mock("@/lib/server/communities-access", () => ({
  findActiveCommunityBySlug: vi.fn(),
  findMembership: vi.fn(),
  canReadCommunityPosts: vi.fn(),
}));

vi.mock("@/lib/server/community-forums-public", () => ({
  findCommunityForumBySlug: vi.fn(),
}));

vi.mock("@/lib/server/community-thread-reply-notify", () => ({
  bumpThreadRootAfterReplyPublished: vi.fn(),
  notifyThreadAuthorOfPublishedReply: vi.fn(),
}));

vi.mock("@/lib/server/community-premoderate", () => ({
  defaultCommunityPostPremoderation: vi.fn(),
}));

vi.mock("@/lib/community-post-api-json", () => ({
  toCommunityPostListApiJson: vi.fn((post) => ({
    id: post.id,
    kind: post.kind,
    body: post.body,
  })),
}));

vi.mock("@/lib/validation/communities", () => ({
  isCommunitySlug: vi.fn(),
  communityPostCreateSchema: {
    safeParse: vi.fn(),
  },
}));

import { POST } from "./route";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { findActiveCommunityBySlug } from "@/lib/server/communities-access";
import { findCommunityForumBySlug } from "@/lib/server/community-forums-public";
import {
  bumpThreadRootAfterReplyPublished,
  notifyThreadAuthorOfPublishedReply,
} from "@/lib/server/community-thread-reply-notify";
import { defaultCommunityPostPremoderation } from "@/lib/server/community-premoderate";
import { communityPostCreateSchema, isCommunitySlug } from "@/lib/validation/communities";

const COMMUNITY_ID = "cjld2cjxh0000qzrmn831i7aa";
const MEMBER_ID = "cjld2cjxh0000qzrmn831i7ab";
const FORUM_ID = "cjld2cjxh0000qzrmn831i7ac";
const ROOT_POST_ID = "cjld2cjxh0000qzrmn831i7ad";

const params = { params: Promise.resolve({ slug: "east-area" }) };

describe("POST /api/communities/[slug]/posts", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(guardMemberAuthApi).mockReturnValue(null);
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(isCommunitySlug).mockReturnValue(true);
    vi.mocked(getMemberSession).mockResolvedValue({ memberId: MEMBER_ID, email: "member@example.com" });
    vi.mocked(findActiveCommunityBySlug).mockResolvedValue({
      id: COMMUNITY_ID,
      slug: "east-area",
      name: "East Area",
      description: "x",
      traditionalAreaName: null,
      joinPolicy: "OPEN",
      visibility: "PUBLIC",
      regionId: null,
    });
    mockPrisma.communityMembership.findUnique.mockResolvedValue({
      communityId: COMMUNITY_ID,
      memberId: MEMBER_ID,
      role: "MEMBER",
      state: "ACTIVE",
    });
    vi.mocked(defaultCommunityPostPremoderation).mockReturnValue(false);
    vi.mocked(findCommunityForumBySlug).mockResolvedValue({
      id: FORUM_ID,
      communityId: COMMUNITY_ID,
      slug: "general",
      name: "General",
      description: null,
      locked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockPrisma.communityPost.findFirst.mockReset();
    mockPrisma.communityPost.create.mockReset();
    mockPrisma.communityForum.findFirst.mockReset();
    vi.mocked(communityPostCreateSchema.safeParse).mockReset();
    vi.mocked(bumpThreadRootAfterReplyPublished).mockReset();
    vi.mocked(notifyThreadAuthorOfPublishedReply).mockReset();
  });

  it("creates a root thread in selected forum", async () => {
    vi.mocked(communityPostCreateSchema.safeParse).mockReturnValue({
      success: true,
      data: { kind: "GENERAL", body: "Hello thread", forumSlug: "general" },
    } as ReturnType<typeof communityPostCreateSchema.safeParse>);
    mockPrisma.communityPost.create.mockResolvedValue({
      id: "post1",
      communityId: COMMUNITY_ID,
      communityForumId: FORUM_ID,
      parentPostId: null,
      authorMemberId: MEMBER_ID,
      kind: "GENERAL",
      title: null,
      body: "Hello thread",
      moderationStatus: "PUBLISHED",
      author: { id: MEMBER_ID, displayName: "Ama" },
      communityForum: { slug: "general", name: "General" },
    });

    const req = new Request("http://localhost/api/communities/east-area/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "GENERAL", body: "Hello thread", forumSlug: "general" }),
    });

    const res = await POST(req, params);
    expect(res.status).toBe(201);
    expect(mockPrisma.communityPost.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          communityForumId: FORUM_ID,
          parentPostId: null,
        }),
      }),
    );
  });

  it("blocks replies to non-published root threads", async () => {
    vi.mocked(communityPostCreateSchema.safeParse).mockReturnValue({
      success: true,
      data: { kind: "GENERAL", body: "Reply body", parentPostId: ROOT_POST_ID },
    } as ReturnType<typeof communityPostCreateSchema.safeParse>);
    mockPrisma.communityPost.findFirst.mockResolvedValue({
      id: ROOT_POST_ID,
      parentPostId: null,
      communityForumId: FORUM_ID,
      moderationStatus: "PENDING",
    });

    const req = new Request("http://localhost/api/communities/east-area/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "GENERAL", body: "Reply body", parentPostId: ROOT_POST_ID }),
    });

    const res = await POST(req, params);
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: "Thread is not available" });
    expect(mockPrisma.communityPost.create).not.toHaveBeenCalled();
  });
});
