import { afterEach, describe, expect, it, vi } from "vitest";

import {
  excludeIncompleteCitationsFromPublicPromotedSurfaces,
  filterPublicPromiseRowsForPromotedSurfaces,
  isIncompleteCatalogueCommitment,
} from "@/lib/promises/incomplete-citations";
import type { PublicPromiseApiRow } from "@/lib/public-promise-api-row";

const catalogueRow: PublicPromiseApiRow = {
  id: "1",
  title: "Economy pledge",
  description: null,
  sourceLabel: "NDC 2024",
  sourceUrl: null,
  sourceDate: null,
  verificationNotes: "mbkru-seed:ndc-2024-catalogue-v1 cluster=economy",
  status: "PENDING",
  blockedReason: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
  electionCycle: "2024",
  partySlug: "ndc",
  manifestoDocumentId: null,
  manifestoPageRef: null,
  isManifestoCatalogueRow: true,
  catalogueThemeSlug: "economy",
  catalogueThemeLabel: "Economy",
  isGovernmentProgramme: true,
  policySector: null,
  manifesto: null,
  member: null,
};

describe("incomplete-citations", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects catalogue rows missing page ref or citation date", () => {
    expect(isIncompleteCatalogueCommitment(catalogueRow)).toBe(true);
    expect(
      isIncompleteCatalogueCommitment({
        ...catalogueRow,
        manifestoPageRef: "p.12",
        sourceDate: "2024-12-01T00:00:00.000Z",
      }),
    ).toBe(false);
    expect(
      isIncompleteCatalogueCommitment({
        ...catalogueRow,
        isManifestoCatalogueRow: false,
        manifestoPageRef: null,
        sourceDate: null,
      }),
    ).toBe(false);
  });

  it("filters promoted rows in production by default", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(excludeIncompleteCitationsFromPublicPromotedSurfaces()).toBe(true);
    expect(filterPublicPromiseRowsForPromotedSurfaces([catalogueRow])).toEqual([]);
  });

  it("includes incomplete rows locally unless forced off", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(filterPublicPromiseRowsForPromotedSurfaces([catalogueRow])).toEqual([catalogueRow]);
  });
});
