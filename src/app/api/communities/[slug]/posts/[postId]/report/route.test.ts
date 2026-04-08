import { beforeEach, describe, expect, it, vi } from "vitest";

const platformPhase = { value: 2 as 1 | 2 | 3 };

vi.mock("@/config/platform", () => ({
  getServerPlatformPhase: () => platformPhase.value,
  platformFeatures: {
    communities: (p: number) => p >= 2,
  },
}));

vi.mock("@/lib/member/auth-api-guard", () => ({
  guardMemberAuthApi: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: vi.fn(),
  prisma: {
    communityPost: { findFirst: vi.fn() },
    communityPostReport: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/server/community-report-notify", () => ({
  notifyCommunityModeratorsOfPostReport: vi.fn(),
}));

vi.mock("@/lib/member/session", () => ({
  getMemberSession: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn(),
}));

vi.mock("@/lib/server/communities-access", () => ({
  canReadCommunityPosts: vi.fn(),
  findActiveCommunityBySlug: vi.fn(),
  findMembership: vi.fn(),
}));

vi.mock("@/lib/validation/communities", () => ({
  isCommunitySlug: vi.fn(),
  communityPostReportSchema: {
    safeParse: vi.fn(),
  },
}));

import { POST } from "./route";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import {
  canReadCommunityPosts,
  findActiveCommunityBySlug,
  findMembership,
} from "@/lib/server/communities-access";
import { communityPostReportSchema, isCommunitySlug } from "@/lib/validation/communities";
import { notifyCommunityModeratorsOfPostReport } from "@/lib/server/community-report-notify";

const params = {
  params: Promise.resolve({
    slug: "east-area",
    postId: "ck1234567890123456789012",
  }),
};

describe("POST /api/communities/[slug]/posts/[postId]/report", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    vi.mocked(guardMemberAuthApi).mockReturnValue(null);
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(isCommunitySlug).mockReturnValue(true);
    vi.mocked(getMemberSession).mockResolvedValue({ memberId: "m2" });
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
    vi.mocked(findMembership).mockResolvedValue({ state: "ACTIVE", role: "MEMBER" });
    vi.mocked(canReadCommunityPosts).mockReturnValue(true);
    vi.mocked(communityPostReportSchema.safeParse).mockReturnValue({
      success: true,
      data: { reason: "Abusive content", details: "Details here" },
    } as ReturnType<typeof communityPostReportSchema.safeParse>);
    vi.mocked(prisma.communityPost.findFirst).mockResolvedValue({
      id: "p1",
      authorMemberId: "m1",
    });
    vi.mocked(prisma.communityPostReport.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.communityPostReport.create).mockResolvedValue({ id: "r1" });
    vi.mocked(notifyCommunityModeratorsOfPostReport).mockResolvedValue();
  });

  it("returns 400 for self-report attempts", async () => {
    vi.mocked(getMemberSession).mockResolvedValue({ memberId: "m1" });
    const req = new Request("https://example.com/api/communities/east-area/posts/p1/report", {
      method: "POST",
      body: JSON.stringify({ reason: "Abusive content" }),
    });
    const res = await POST(req, params);
    expect(res.status).toBe(400);
  });

  it("returns 409 when user already has an open report", async () => {
    vi.mocked(prisma.communityPostReport.findFirst).mockResolvedValue({ id: "open1" });
    const req = new Request("https://example.com/api/communities/east-area/posts/p1/report", {
      method: "POST",
      body: JSON.stringify({ reason: "Abusive content" }),
    });
    const res = await POST(req, params);
    expect(res.status).toBe(409);
  });

  it("creates report and notifies moderators", async () => {
    const req = new Request("https://example.com/api/communities/east-area/posts/p1/report", {
      method: "POST",
      body: JSON.stringify({ reason: "Abusive content", details: "Details here" }),
    });
    const res = await POST(req, params);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(prisma.communityPostReport.create).toHaveBeenCalledTimes(1);
    expect(notifyCommunityModeratorsOfPostReport).toHaveBeenCalledWith({
      communityId: "c1",
      postId: "p1",
      reason: "Abusive content",
      communitySlug: "east-area",
      communityName: "East Area",
    });
  });
});
