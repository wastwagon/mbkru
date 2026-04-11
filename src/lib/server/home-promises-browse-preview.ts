import "server-only";

import { Prisma } from "@prisma/client";

import { isDatabaseConfigured } from "@/lib/db/prisma";
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

function isRecoverableSchemaError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021";
}

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
    if (isRecoverableSchemaError(e)) return null;
    throw e;
  }
}
