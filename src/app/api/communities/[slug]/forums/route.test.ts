import { Prisma } from "@prisma/client";
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
    communityForum: { findUnique: vi.fn(), create: vi.fn() },
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
  listCommunityForums: vi.fn(),
}));

vi.mock("@/lib/validation/communities", () => ({
  isCommunitySlug: vi.fn(),
  forumSlugFromName: vi.fn(),
  communityForumCreateSchema: {
    safeParse: vi.fn(),
  },
}));

import { GET, POST } from "./route";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import {
  canReadCommunityPosts,
  findActiveCommunityBySlug,
  findMembership,
} from "@/lib/server/communities-access";
import { listCommunityForums } from "@/lib/server/community-forums-public";
import { communityForumCreateSchema, forumSlugFromName, isCommunitySlug } from "@/lib/validation/communities";

const COMMUNITY_ID = "cjld2cjxh0000qzrmn831i7aa";
const MEMBER_ID = "cjld2cjxh0000qzrmn831i7ab";

const params = { params: Promise.resolve({ slug: "east-area" }) };

describe("/api/communities/[slug]/forums", () => {
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
    vi.mocked(findMembership).mockResolvedValue({
      state: "ACTIVE",
      role: "MODERATOR",
    } as Awaited<ReturnType<typeof findMembership>>);
    vi.mocked(canReadCommunityPosts).mockReturnValue(true);
    vi.mocked(listCommunityForums).mockResolvedValue([]);
    vi.mocked(forumSlugFromName).mockReturnValue("general-chat");
    vi.mocked(communityForumCreateSchema.safeParse).mockReset();
    mockPrisma.communityForum.findUnique.mockReset();
    mockPrisma.communityForum.create.mockReset();
    mockPrisma.communityMembership.findUnique.mockReset();
  });

  it("GET returns forums when viewer can read", async () => {
    vi.mocked(listCommunityForums).mockResolvedValue([
      {
        id: "f1",
        slug: "general",
        name: "General",
        description: null,
        locked: false,
        createdAt: new Date("2026-04-28T08:00:00.000Z"),
        publishedThreadCount: 4,
        lastActivityAt: new Date("2026-04-28T08:05:00.000Z"),
      },
    ]);
    const req = new Request("http://localhost/api/communities/east-area/forums");
    const res = await GET(req, params);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.forums[0].slug).toBe("general");
    expect(json.forums[0].publishedThreadCount).toBe(4);
  });

  it("POST rejects non-privileged members", async () => {
    mockPrisma.communityMembership.findUnique.mockResolvedValue({
      communityId: COMMUNITY_ID,
      memberId: MEMBER_ID,
      role: "MEMBER",
      state: "ACTIVE",
    });
    vi.mocked(communityForumCreateSchema.safeParse).mockReturnValue({
      success: true,
      data: { name: "General Chat", slug: "general-chat" },
    } as ReturnType<typeof communityForumCreateSchema.safeParse>);

    const req = new Request("http://localhost/api/communities/east-area/forums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "General Chat", slug: "general-chat" }),
    });
    const res = await POST(req, params);
    expect(res.status).toBe(403);
  });

  it("POST returns 409 on unique slug race", async () => {
    mockPrisma.communityMembership.findUnique.mockResolvedValue({
      communityId: COMMUNITY_ID,
      memberId: MEMBER_ID,
      role: "MODERATOR",
      state: "ACTIVE",
    });
    vi.mocked(communityForumCreateSchema.safeParse).mockReturnValue({
      success: true,
      data: { name: "General Chat", slug: "general-chat" },
    } as ReturnType<typeof communityForumCreateSchema.safeParse>);
    mockPrisma.communityForum.findUnique.mockResolvedValue(null);
    mockPrisma.communityForum.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique failed", {
        code: "P2002",
        clientVersion: "6.19.0",
      }),
    );

    const req = new Request("http://localhost/api/communities/east-area/forums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "General Chat", slug: "general-chat" }),
    });
    const res = await POST(req, params);
    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({ error: "Forum slug already exists" });
  });
});
