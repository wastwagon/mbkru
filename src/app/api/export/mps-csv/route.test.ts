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
  accountabilityPublicCacheControl: () => "public, max-age=60, s-maxage=60",
  getCachedMpsPublicRoster: vi.fn(),
}));

import { GET } from "./route";
import { getCachedMpsPublicRoster } from "@/lib/server/accountability-cache";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

describe("GET /api/export/mps-csv", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    dbConfigured.value = true;
    vi.mocked(getCachedMpsPublicRoster).mockReset();
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
  });

  it("returns 404 when parliament data feature is off", async () => {
    platformPhase.value = 1;
    const res = await GET(new Request("https://example.com/api/export/mps-csv"));
    expect(res.status).toBe(404);
  });

  it("returns 503 when database is not configured", async () => {
    dbConfigured.value = false;
    const res = await GET(new Request("https://example.com/api/export/mps-csv"));
    expect(res.status).toBe(503);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const res = await GET(new Request("https://example.com/api/export/mps-csv"));
    expect(res.status).toBe(429);
  });

  it("returns CSV with BOM and escaped fields", async () => {
    vi.mocked(getCachedMpsPublicRoster).mockResolvedValue([
      {
        slug: "demo",
        name: 'Demo, Esq.',
        role: "MP",
        party: "IND",
        constituencyName: "Sample North",
        promiseCount: 2,
        mpVoiceReportCount: 1,
      },
    ]);
    const res = await GET(new Request("https://example.com/api/export/mps-csv"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Cache-Control")).toContain("public");
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(buf[0]).toBe(0xef);
    expect(buf[1]).toBe(0xbb);
    expect(buf[2]).toBe(0xbf);
    const text = new TextDecoder("utf-8").decode(buf);
    expect(text).toContain("slug,name,role,party,constituency_name,promise_count,mp_voice_report_count");
    expect(text).toContain('"Demo, Esq."');
    expect(text).toContain("Sample North");
    expect(text).toContain(",2,1");
  });
});
