import { beforeEach, describe, expect, it, vi } from "vitest";

const platformPhase = { value: 2 as 1 | 2 | 3 };
const dbConfigured = { value: true };

vi.mock("@/config/platform", () => ({
  getServerPlatformPhase: () => platformPhase.value,
  platformFeatures: {
    parliamentTrackerData: (p: number) => p >= 2,
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: () => dbConfigured.value,
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/server/accountability-cache", () => ({
  accountabilityPublicCacheControl: () => "public, max-age=60",
  getCachedTrackerConstituencies: vi.fn(),
}));

import { GET } from "./route";
import { getCachedTrackerConstituencies } from "@/lib/server/accountability-cache";

describe("GET /api/accountability/tracker-constituencies", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    dbConfigured.value = true;
    vi.mocked(getCachedTrackerConstituencies).mockReset();
    vi.mocked(getCachedTrackerConstituencies).mockResolvedValue([
      { slug: "abetifi", name: "Abetifi", regionName: "Eastern", mp: { name: "Bryan Acheampong", slug: "bryan-acheampong" } },
    ]);
  });

  it("returns 404 when parliament tracker feature is off", async () => {
    platformPhase.value = 1;
    const res = await GET(new Request("https://example.com/api/accountability/tracker-constituencies"));
    expect(res.status).toBe(404);
  });

  it("returns constituencies payload", async () => {
    const res = await GET(new Request("https://example.com/api/accountability/tracker-constituencies"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.constituencies).toHaveLength(1);
    expect(json.constituencies[0].slug).toBe("abetifi");
  });
});
