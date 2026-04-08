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

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn(),
}));

vi.mock("@/lib/validation/communities", () => ({
  normalizeCommunitySearchQuery: vi.fn(),
}));

vi.mock("@/lib/server/communities-search", () => ({
  searchCommunitiesAndPosts: vi.fn(),
}));

import { GET } from "./route";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { normalizeCommunitySearchQuery } from "@/lib/validation/communities";
import { searchCommunitiesAndPosts } from "@/lib/server/communities-search";

describe("GET /api/communities/search", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(normalizeCommunitySearchQuery).mockReturnValue("east area");
    vi.mocked(searchCommunitiesAndPosts).mockResolvedValue({
      query: "east area",
      communities: [],
      posts: [],
    });
  });

  it("returns 404 when feature is disabled", async () => {
    platformPhase.value = 1;
    const res = await GET(new Request("https://example.com/api/communities/search?q=east"));
    expect(res.status).toBe(404);
  });

  it("returns 503 when database is not configured", async () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    const res = await GET(new Request("https://example.com/api/communities/search?q=east"));
    expect(res.status).toBe(503);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const res = await GET(new Request("https://example.com/api/communities/search?q=east"));
    expect(res.status).toBe(429);
  });

  it("returns 400 for short/invalid query", async () => {
    vi.mocked(normalizeCommunitySearchQuery).mockReturnValue(null);
    const res = await GET(new Request("https://example.com/api/communities/search?q=a"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("at least 2");
  });

  it("returns search payload with no-store header", async () => {
    vi.mocked(searchCommunitiesAndPosts).mockResolvedValue({
      query: "east area",
      communities: [
        {
          slug: "east-area",
          name: "East Area",
          traditionalAreaName: null,
          joinPolicy: "OPEN",
          visibility: "PUBLIC",
          description: "desc",
          region: null,
          memberCount: 3,
        },
      ],
      posts: [
        {
          postId: "p1",
          communitySlug: "east-area",
          communityName: "East Area",
          snippet: "hello",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    const res = await GET(new Request("https://example.com/api/communities/search?q=east"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const json = await res.json();
    expect(json.query).toBe("east area");
    expect(json.communities).toHaveLength(1);
    expect(json.posts).toHaveLength(1);
    expect(searchCommunitiesAndPosts).toHaveBeenCalledWith("east area");
  });
});
