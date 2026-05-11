import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/member/session", () => ({
  getMemberSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/server/community-presence", () => ({
  countOnlineInCommunity: vi.fn(),
  listOnlineMemberIdsInCommunity: vi.fn(),
}));

vi.mock("@/lib/reports/accountability-pages", () => ({
  isCommunitiesBrowseEnabled: vi.fn().mockReturnValue(true),
}));

vi.mock("@/config/platform", () => ({
  getServerPlatformPhase: vi.fn().mockReturnValue(2),
  platformFeatures: {
    communities: vi.fn().mockReturnValue(true),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    community: { findFirst: vi.fn() },
    member: { findMany: vi.fn() },
  },
  isDatabaseConfigured: vi.fn().mockReturnValue(true),
}));

import { GET } from "./route";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getMemberSessionFromRequest } from "@/lib/member/session";
import { countOnlineInCommunity, listOnlineMemberIdsInCommunity } from "@/lib/server/community-presence";

describe("GET /api/communities/[slug]/presence", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(countOnlineInCommunity).mockClear();
    vi.mocked(listOnlineMemberIdsInCommunity).mockClear();
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(prisma.community.findFirst).mockResolvedValue({
      id: "c1",
      name: "Test Community",
      slug: "test-community",
    } as never);
    vi.mocked(countOnlineInCommunity).mockResolvedValue(4);
    vi.mocked(listOnlineMemberIdsInCommunity).mockResolvedValue(["m1"]);
    vi.mocked(prisma.member.findMany).mockResolvedValue([{ id: "m1", displayName: "Kofi" }] as never);
  });

  it("omits peer names when guest", async () => {
    vi.mocked(getMemberSessionFromRequest).mockResolvedValue(null);
    const res = await GET(new Request("https://x/api/communities/test-community/presence"), {
      params: Promise.resolve({ slug: "test-community" }),
    });
    expect(res.status).toBe(200);
    const j = (await res.json()) as {
      peerDetailsVisible: boolean;
      onlinePeers: unknown[];
      onlineCount: number | null;
      onlineCountsVisible: boolean;
      community: { slug: string };
    };
    expect(j.community.slug).toBe("test-community");
    expect(j.onlineCount).toBe(4);
    expect(j.onlineCountsVisible).toBe(true);
    expect(j.peerDetailsVisible).toBe(false);
    expect(j.onlinePeers).toEqual([]);
    expect(listOnlineMemberIdsInCommunity).not.toHaveBeenCalled();
  });

  it("omits aggregate guest counts when MBKRU_PRESENCE_COUNTS_PUBLIC is off", async () => {
    vi.stubEnv("MBKRU_PRESENCE_COUNTS_PUBLIC", "0");
    vi.mocked(getMemberSessionFromRequest).mockResolvedValue(null);
    const res = await GET(new Request("https://x/api/communities/test-community/presence"), {
      params: Promise.resolve({ slug: "test-community" }),
    });
    expect(res.status).toBe(200);
    const j = (await res.json()) as {
      onlineCount: number | null;
      onlineCountsVisible: boolean;
    };
    expect(j.onlineCount).toBeNull();
    expect(j.onlineCountsVisible).toBe(false);
    expect(countOnlineInCommunity).not.toHaveBeenCalled();
  });

  it("omits aggregate guest counts when only legacy MBKRU_REGION_PRESENCE_COUNTS_PUBLIC is off", async () => {
    vi.stubEnv("MBKRU_REGION_PRESENCE_COUNTS_PUBLIC", "0");
    vi.mocked(getMemberSessionFromRequest).mockResolvedValue(null);
    const res = await GET(new Request("https://x/api/communities/test-community/presence"), {
      params: Promise.resolve({ slug: "test-community" }),
    });
    expect(res.status).toBe(200);
    const j = (await res.json()) as {
      onlineCount: number | null;
      onlineCountsVisible: boolean;
    };
    expect(j.onlineCount).toBeNull();
    expect(j.onlineCountsVisible).toBe(false);
    expect(countOnlineInCommunity).not.toHaveBeenCalled();
  });

  it("includes peer names when signed in", async () => {
    vi.mocked(getMemberSessionFromRequest).mockResolvedValue({ memberId: "me", email: "a@b.com" });
    const res = await GET(new Request("https://x/api/communities/test-community/presence"), {
      params: Promise.resolve({ slug: "test-community" }),
    });
    const j = (await res.json()) as {
      peerDetailsVisible: boolean;
      onlinePeers: { label: string }[];
    };
    expect(j.peerDetailsVisible).toBe(true);
    expect(j.onlinePeers.some((p) => p.label === "Kofi")).toBe(true);
    expect(listOnlineMemberIdsInCommunity).toHaveBeenCalled();
  });
});
