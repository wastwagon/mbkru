import type { Prisma } from "@prisma/client";

import { MBKRU_MANIFESTO_CATALOGUE_SEED_PREFIX } from "@/lib/promise-catalogue-display";
import type { PublicPromiseApiRow } from "@/lib/public-promise-api-row";

/**
 * Whether promoted public surfaces (homepage government preview) should hide catalogue
 * rows missing a page reference or citation date.
 *
 * - Production: exclude by default.
 * - Local/staging: include unless `EXCLUDE_INCOMPLETE_CITATIONS_FROM_PUBLIC=1`.
 * - Override with `INCLUDE_INCOMPLETE_CITATIONS_ON_PUBLIC=1` (editorial QA).
 */
export function excludeIncompleteCitationsFromPublicPromotedSurfaces(): boolean {
  if (process.env.INCLUDE_INCOMPLETE_CITATIONS_ON_PUBLIC === "1") return false;
  if (process.env.EXCLUDE_INCOMPLETE_CITATIONS_FROM_PUBLIC === "1") return true;
  return process.env.NODE_ENV === "production";
}

export function isIncompleteCatalogueCommitment(row: {
  isManifestoCatalogueRow: boolean;
  manifestoPageRef: string | null;
  sourceDate: string | null;
}): boolean {
  if (!row.isManifestoCatalogueRow) return false;
  return !row.manifestoPageRef?.trim() || !row.sourceDate;
}

export function filterPublicPromiseRowsForPromotedSurfaces<T extends PublicPromiseApiRow>(
  rows: T[],
): T[] {
  if (!excludeIncompleteCitationsFromPublicPromotedSurfaces()) return rows;
  return rows.filter((r) => !isIncompleteCatalogueCommitment(r));
}

/** Catalogue seed rows in DB still missing page ref or citation date (launch-readiness counts). */
export function incompleteCatalogueCommitmentsInDbWhere(): Prisma.CampaignPromiseWhereInput {
  return {
    verificationNotes: { startsWith: MBKRU_MANIFESTO_CATALOGUE_SEED_PREFIX },
    OR: [{ manifestoPageRef: null }, { sourceDate: null }],
  };
}
