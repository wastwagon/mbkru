import "server-only";

import { isDatabaseConfigured } from "@/lib/db/prisma";
import { isRecoverablePrismaSchemaError } from "@/lib/db/prisma-schema-recoverable";
import { parsePromisesApiFilters } from "@/lib/promises-api-filters";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";
import type { GovernmentCommitmentsHomePreview } from "@/lib/home-government-preview-types";
import type { PublicPromiseApiRow } from "@/lib/public-promise-api-row";
import {
  getCachedPromiseTrackerStats,
  getCachedPromisesApiRows,
  getCachedTrackerConstituencies,
} from "@/lib/server/accountability-cache";

export type { GovernmentCommitmentsHomePreview } from "@/lib/home-government-preview-types";

function buildGovernmentOnlyFiltersUrl(): URL {
  const u = new URL("http://local/");
  u.searchParams.set("governmentOnly", "true");
  return u;
}

/** Same filters as the government-programme lens (`/promises/browse?governmentOnly=1`) — for homepage preview consistency. */
export async function getGovernmentCommitmentsHomePreview(): Promise<GovernmentCommitmentsHomePreview | null> {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) return null;
  try {
    const filters = parsePromisesApiFilters(buildGovernmentOnlyFiltersUrl());
    const [stats, apiRows, trackerConstituencies] = await Promise.all([
      getCachedPromiseTrackerStats(filters),
      getCachedPromisesApiRows(filters),
      getCachedTrackerConstituencies(),
    ]);
    const initialRows = apiRows as PublicPromiseApiRow[];
    return { stats, initialRows, trackerConstituencies };
  } catch (e) {
    if (isRecoverablePrismaSchemaError(e)) return null;
    console.error("[home-government-preview]", e);
    return null;
  }
}
