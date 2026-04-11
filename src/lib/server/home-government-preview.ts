import "server-only";

import { Prisma } from "@prisma/client";

import { isDatabaseConfigured } from "@/lib/db/prisma";
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

function isRecoverableSchemaError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021";
}

/** Same filters as `/government-commitments` default view — for homepage preview consistency. */
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
    if (isRecoverableSchemaError(e)) return null;
    throw e;
  }
}
