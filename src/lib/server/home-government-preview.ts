import "server-only";

import { Prisma } from "@prisma/client";

import { isDatabaseConfigured } from "@/lib/db/prisma";
import { parsePromisesApiFilters } from "@/lib/promises-api-filters";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";
import type {
  GovernmentCommitmentHomeRow,
  GovernmentCommitmentsHomePreview,
} from "@/lib/home-government-preview-types";
import { getCachedPromiseTrackerStats, getCachedPromisesApiRows } from "@/lib/server/accountability-cache";

export type {
  GovernmentCommitmentHomeRow,
  GovernmentCommitmentsHomePreview,
} from "@/lib/home-government-preview-types";

const PREVIEW_MAX = 6;

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
    const [stats, apiRows] = await Promise.all([
      getCachedPromiseTrackerStats(filters),
      getCachedPromisesApiRows(filters),
    ]);
    const rows: GovernmentCommitmentHomeRow[] = apiRows.slice(0, PREVIEW_MAX).map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      member: r.member ? { name: r.member.name, slug: r.member.slug } : null,
    }));
    return { stats, rows };
  } catch (e) {
    if (isRecoverableSchemaError(e)) return null;
    throw e;
  }
}
