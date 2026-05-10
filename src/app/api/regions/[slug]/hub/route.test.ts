import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/member/session", () => ({
  getMemberSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/server/region-presence", () => ({
  countOnlineInRegion: vi.fn(),
  listOnlineMemberIdsInRegion: vi.fn(),
}));

vi.mock("@/lib/reports/accountability-pages", () => ({
  isReportCardPublicEnabled: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/reports/citizens-voice-gate", () => ({
  isCitizensVoiceEnabled: vi.fn().mockReturnValue(true),
}));

vi.mock("@/config/platform", () => ({
  getServerPlatformPhase: vi.fn().mockReturnValue(2),
  platformFeatures: {
    communities: vi.fn().mockReturnValue(true),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    region: { findUnique: vi.fn() },
    community: { findFirst: vi.fn() },
    member: { findMany: vi.fn() },
  },
  isDatabaseConfigured: vi.fn().mockReturnValue(true),
}));

import { GET } from "./route";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getMemberSessionFromRequest } from "@/lib/member/session";
import { countOnlineInRegion, listOnlineMemberIdsInRegion } from "@/lib/server/region-presence";

describe("GET /api/regions/[slug]/hub", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(countOnlineInRegion).mockClear();
    vi.mocked(listOnlineMemberIdsInRegion).mockClear();
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(prisma.region.findUnique).mockResolvedValue({
      id: "reg1",
      name: "Upper West",
      slug: "upper-west",
    } as never);
    vi.mocked(prisma.community.findFirst).mockResolvedValue({ slug: "mbkru-region-hub-upper-west" } as never);
    vi.mocked(countOnlineInRegion).mockResolvedValue(3);
    vi.mocked(listOnlineMemberIdsInRegion).mockResolvedValue(["m1"]);
    vi.mocked(prisma.member.findMany).mockResolvedValue([{ id: "m1", displayName: "Ada" }] as never);
  });

  it("omits peer names when guest", async () => {
    vi.mocked(getMemberSessionFromRequest).mockResolvedValue(null);
    const res = await GET(new Request("https://x/api/regions/upper-west/hub"), {
      params: Promise.resolve({ slug: "upper-west" }),
    });
    expect(res.status).toBe(200);
    const j = (await res.json()) as {
      peerDetailsVisible: boolean;
      onlinePeers: unknown[];
      onlineCount: number | null;
      onlineCountsVisible: boolean;
    };
    expect(j.onlineCount).toBe(3);
    expect(j.onlineCountsVisible).toBe(true);
    expect(j.peerDetailsVisible).toBe(false);
    expect(j.onlinePeers).toEqual([]);
    expect(listOnlineMemberIdsInRegion).not.toHaveBeenCalled();
  });

  it("omits aggregate guest counts when MBKRU_REGION_PRESENCE_COUNTS_PUBLIC is off", async () => {
    vi.stubEnv("MBKRU_REGION_PRESENCE_COUNTS_PUBLIC", "0");
    vi.mocked(getMemberSessionFromRequest).mockResolvedValue(null);
    const res = await GET(new Request("https://x/api/regions/upper-west/hub"), {
      params: Promise.resolve({ slug: "upper-west" }),
    });
    expect(res.status).toBe(200);
    const j = (await res.json()) as {
      onlineCount: number | null;
      onlineCountsVisible: boolean;
    };
    expect(j.onlineCount).toBeNull();
    expect(j.onlineCountsVisible).toBe(false);
    expect(countOnlineInRegion).not.toHaveBeenCalled();
  });

  it("includes peer names when signed in", async () => {
    vi.mocked(getMemberSessionFromRequest).mockResolvedValue({ memberId: "me", email: "a@b.com" });
    const res = await GET(new Request("https://x/api/regions/upper-west/hub"), {
      params: Promise.resolve({ slug: "upper-west" }),
    });
    const j = (await res.json()) as {
      peerDetailsVisible: boolean;
      onlinePeers: { label: string }[];
    };
    expect(j.peerDetailsVisible).toBe(true);
    expect(j.onlinePeers.some((p) => p.label === "Ada")).toBe(true);
    expect(listOnlineMemberIdsInRegion).toHaveBeenCalled();
  });
});
