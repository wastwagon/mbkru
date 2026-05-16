import "server-only";

import { isDatabaseConfigured } from "@/lib/db/prisma";
import { isRecoverablePrismaSchemaError } from "@/lib/db/prisma-schema-recoverable";
import type { PromisesBrowseHomePreview } from "@/lib/home-promises-browse-preview-types";
import { parsePromisesApiFilters } from "@/lib/promises-api-filters";
import type { PublicPromiseApiRow } from "@/lib/public-promise-api-row";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";
import {
  getCachedPromiseTrackerStats,
  getCachedPromisesApiRows,
  getCachedTrackerConstituencies,
} from "@/lib/server/accountability-cache";

export type { PromisesBrowseHomePreview } from "@/lib/home-promises-browse-preview-types";

/** Same default filter scope as `/promises/browse` — full catalogue for the live table. */
export async function getPromisesBrowseHomePreview(): Promise<PromisesBrowseHomePreview | null> {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) return null;
  try {
    const filters = parsePromisesApiFilters(new URL("http://local/"));
    const [stats, apiRows, trackerConstituencies] = await Promise.all([
      getCachedPromiseTrackerStats(filters),
      getCachedPromisesApiRows(filters),
      getCachedTrackerConstituencies(),
    ]);
    const initialRows = apiRows as PublicPromiseApiRow[];
    return { stats, initialRows, trackerConstituencies };
  } catch (e) {
    if (isRecoverablePrismaSchemaError(e)) return null;
    console.error("[home-promises-browse-preview]", e);
    return null;
  }
}
