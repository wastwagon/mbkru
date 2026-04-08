import { beforeEach, describe, expect, it, vi } from "vitest";

const platformPhase = { value: 2 as 1 | 2 | 3 };

vi.mock("@/config/platform", () => ({
  getServerPlatformPhase: () => platformPhase.value,
  platformFeatures: {
    communities: (p: number) => p >= 2,
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: vi.fn(),
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

vi.mock("@/lib/server/community-posts-public", () => ({
  getCommunityPostForViewer: vi.fn(),
}));

vi.mock("@/lib/validation/communities", () => ({
  isCommunitySlug: vi.fn(),
}));

import { GET } from "./route";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import {
  canReadCommunityPosts,
  findActiveCommunityBySlug,
  findMembership,
} from "@/lib/server/communities-access";
import { getCommunityPostForViewer } from "@/lib/server/community-posts-public";
import { isCommunitySlug } from "@/lib/validation/communities";

const params = { params: Promise.resolve({ slug: "east-area", postId: "post1" }) };

describe("GET /api/communities/[slug]/posts/[postId]", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(isCommunitySlug).mockReturnValue(true);
    vi.mocked(getMemberSession).mockResolvedValue(null);
    vi.mocked(findMembership).mockResolvedValue(null);
    vi.mocked(findActiveCommunityBySlug).mockResolvedValue({
      id: "c1",
      slug: "east-area",
      name: "East Area",
      description: "x",
      traditionalAreaName: null,
      joinPolicy: "OPEN",
      visibility: "PUBLIC",
      regionId: null,
    });
    vi.mocked(canReadCommunityPosts).mockReturnValue(true);
    vi.mocked(getCommunityPostForViewer).mockResolvedValue({
      id: "post1",
      communityId: "c1",
      authorMemberId: "m1",
      kind: "GENERAL",
      body: "Hello community",
      moderationStatus: "PUBLISHED",
      pinned: false,
      moderatedAt: null,
      moderatedByAdminId: null,
      rejectionReason: null,
      createdAt: new Date("2026-04-08T10:00:00.000Z"),
      updatedAt: new Date("2026-04-08T10:00:00.000Z"),
      author: { id: "m1", displayName: "Ama" },
    } as Awaited<ReturnType<typeof getCommunityPostForViewer>>);
  });

  it("returns 404 when communities feature is disabled", async () => {
    platformPhase.value = 1;
    const res = await GET(new Request("https://example.com/api/communities/east-area/posts/post1"), params);
    expect(res.status).toBe(404);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const res = await GET(new Request("https://example.com/api/communities/east-area/posts/post1"), params);
    expect(res.status).toBe(429);
  });

  it("returns 403 when reader cannot access posts", async () => {
    vi.mocked(canReadCommunityPosts).mockReturnValue(false);
    const res = await GET(new Request("https://example.com/api/communities/east-area/posts/post1"), params);
    expect(res.status).toBe(403);
  });

  it("returns 404 when post is not visible/found", async () => {
    vi.mocked(getCommunityPostForViewer).mockResolvedValue(null);
    const res = await GET(new Request("https://example.com/api/communities/east-area/posts/post1"), params);
    expect(res.status).toBe(404);
  });

  it("returns normalized post payload", async () => {
    const res = await GET(new Request("https://example.com/api/communities/east-area/posts/post1"), params);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.post.id).toBe("post1");
    expect(json.post.community.slug).toBe("east-area");
    expect(json.post.author.displayName).toBe("Ama");
    expect(json.post.createdAt).toContain("2026-04-08");
  });
});
