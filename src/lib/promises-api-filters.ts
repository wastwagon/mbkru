/** Shared by `GET /api/promises`, CSV export, and tests (no server-only). */

import { isPolicySectorValue } from "@/lib/promise-policy-sectors";

const PROMISE_STATUS_PARAMS = [
  "TRACKING",
  "IN_PROGRESS",
  "FULFILLED",
  "BROKEN",
  "DEFERRED",
] as const;

export type PromisesApiFilters = {
  memberSlug: string;
  partySlug: string;
  electionCycle: string;
  governmentOnly: boolean;
  policySector: string;
  /** Empty string = all statuses. */
  status: string;
};

export function parsePromisesApiFilters(url: URL): PromisesApiFilters {
  const sp = url.searchParams;
  const gov = sp.get("governmentOnly");
  const governmentOnly =
    gov === "1" || gov?.toLowerCase() === "true" || gov?.toLowerCase() === "yes";

  const statusRaw = sp.get("status")?.trim().toUpperCase() ?? "";
  const status = (PROMISE_STATUS_PARAMS as readonly string[]).includes(statusRaw) ? statusRaw : "";

  const sectorRaw = sp.get("policySector")?.trim().toUpperCase() ?? "";
  const policySector = isPolicySectorValue(sectorRaw) ? sectorRaw : "";

  return {
    memberSlug: sp.get("memberSlug")?.trim().toLowerCase() ?? "",
    partySlug: sp.get("partySlug")?.trim().toLowerCase() ?? "",
    electionCycle: sp.get("electionCycle")?.trim() ?? "",
    governmentOnly,
    policySector,
    status,
  };
}
