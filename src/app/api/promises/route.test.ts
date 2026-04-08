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
  getCachedPromisesApiRows: vi.fn(),
}));

import { GET } from "./route";
import { getCachedPromisesApiRows } from "@/lib/server/accountability-cache";

describe("GET /api/promises", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    dbConfigured.value = true;
    vi.mocked(getCachedPromisesApiRows).mockReset();
    vi.mocked(getCachedPromisesApiRows).mockResolvedValue([]);
  });

  it("returns 404 when parliament tracker feature is off", async () => {
    platformPhase.value = 1;
    const res = await GET(new Request("https://example.com/api/promises"));
    expect(res.status).toBe(404);
  });

  const emptyFilters = {
    memberSlug: "",
    partySlug: "",
    electionCycle: "",
    governmentOnly: false,
    policySector: "",
    status: "",
  };

  it("passes normalized filters to cache loader", async () => {
    await GET(new Request("https://example.com/api/promises?memberSlug=Jane-Doe"));
    expect(getCachedPromisesApiRows).toHaveBeenCalledWith({
      ...emptyFilters,
      memberSlug: "jane-doe",
    });
  });

  it("parses governmentOnly and party filters", async () => {
    await GET(
      new Request(
        "https://example.com/api/promises?partySlug=NDC&electionCycle=2024&governmentOnly=true",
      ),
    );
    expect(getCachedPromisesApiRows).toHaveBeenCalledWith({
      memberSlug: "",
      partySlug: "ndc",
      electionCycle: "2024",
      governmentOnly: true,
      policySector: "",
      status: "",
    });
  });

  it("parses policySector and status", async () => {
    await GET(new Request("https://example.com/api/promises?policySector=fiscal&status=in_progress"));
    expect(getCachedPromisesApiRows).toHaveBeenCalledWith({
      ...emptyFilters,
      policySector: "FISCAL",
      status: "IN_PROGRESS",
    });
  });

  it("returns promises array and cache header", async () => {
    vi.mocked(getCachedPromisesApiRows).mockResolvedValue([
      {
        id: "p1",
        title: "Demo",
        description: null,
        sourceLabel: "seed",
        sourceUrl: null,
        sourceDate: null,
        verificationNotes: null,
        status: "TRACKING",
        updatedAt: "2026-03-28T00:00:00.000Z",
        electionCycle: null,
        partySlug: null,
        manifestoDocumentId: null,
        manifestoPageRef: null,
        isGovernmentProgramme: false,
        policySector: null,
        manifesto: null,
        member: { name: "A", slug: "a", role: "MP", party: null },
      },
    ]);
    const res = await GET(new Request("https://example.com/api/promises"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("public");
    const json = await res.json();
    expect(json.promises).toHaveLength(1);
    expect(json.promises[0].title).toBe("Demo");
  });
});
