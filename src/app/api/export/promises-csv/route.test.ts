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
  getCachedPromisesExportCsvRows: vi.fn(),
}));

import { GET } from "./route";
import { getCachedPromisesExportCsvRows } from "@/lib/server/accountability-cache";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

describe("GET /api/export/promises-csv", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    dbConfigured.value = true;
    vi.mocked(getCachedPromisesExportCsvRows).mockReset();
    vi.mocked(getCachedPromisesExportCsvRows).mockResolvedValue([]);
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
  });

  it("returns 404 when parliament tracker feature is off", async () => {
    platformPhase.value = 1;
    const res = await GET(new Request("https://example.com/api/export/promises-csv"));
    expect(res.status).toBe(404);
  });

  it("returns 503 when database is not configured", async () => {
    dbConfigured.value = false;
    const res = await GET(new Request("https://example.com/api/export/promises-csv"));
    expect(res.status).toBe(503);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const res = await GET(new Request("https://example.com/api/export/promises-csv"));
    expect(res.status).toBe(429);
  });

  const emptyFilters = {
    memberSlug: "",
    partySlug: "",
    electionCycle: "",
    governmentOnly: false,
    policySector: "",
    status: "",
  };

  it("passes normalized filters to loader", async () => {
    await GET(new Request("https://example.com/api/export/promises-csv?memberSlug=Jane-Doe"));
    expect(getCachedPromisesExportCsvRows).toHaveBeenCalledWith({
      ...emptyFilters,
      memberSlug: "jane-doe",
    });
  });

  it("returns CSV with BOM and header row", async () => {
    vi.mocked(getCachedPromisesExportCsvRows).mockResolvedValue([
      {
        id: "p1",
        title: 'Free, fair',
        description: "Line1\nLine2",
        sourceLabel: "manifesto",
        sourceUrl: "https://example.com/doc",
        sourceDate: "2024-01-01T00:00:00.000Z",
        verificationNotes: "Checked against PDF.",
        status: "TRACKING",
        policySector: "FISCAL",
        updatedAt: "2026-03-28T00:00:00.000Z",
        electionCycle: "2024",
        partySlug: "ndc",
        manifestoDocumentId: "md1",
        manifestoPageRef: "p.12",
        isGovernmentProgramme: true,
        manifestoTitle: "2024 manifesto",
        manifestoSourceUrl: "https://example.com/manifesto.pdf",
        member: { name: "A", slug: "a", role: "MP", party: null },
      },
    ]);
    const res = await GET(new Request("https://example.com/api/export/promises-csv"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(buf[0]).toBe(0xef);
    expect(buf[1]).toBe(0xbb);
    expect(buf[2]).toBe(0xbf);
    const text = new TextDecoder("utf-8").decode(buf);
    expect(text).toContain(
      "id,title,description,source_label,source_url,source_date,verification_notes,status,policy_sector,updated_at,election_cycle,party_slug,manifesto_document_id,manifesto_page_ref,is_government_programme,manifesto_title,manifesto_source_url,member_name,member_slug,member_role,member_party",
    );
    expect(text).toContain('"Free, fair"');
    expect(text).toContain('"Line1\nLine2"');
  });
});
