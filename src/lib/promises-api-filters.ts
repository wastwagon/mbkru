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
  /** Title/description contains (case-insensitive); capped length for API safety. */
  q: string;
};

const MAX_Q_LEN = 120;

export function parsePromisesApiFilters(url: URL): PromisesApiFilters {
  const sp = url.searchParams;
  const gov = sp.get("governmentOnly");
  const governmentOnly =
    gov === "1" || gov?.toLowerCase() === "true" || gov?.toLowerCase() === "yes";

  const statusRaw = sp.get("status")?.trim().toUpperCase() ?? "";
  const status = (PROMISE_STATUS_PARAMS as readonly string[]).includes(statusRaw) ? statusRaw : "";

  const sectorRaw = sp.get("policySector")?.trim().toUpperCase() ?? "";
  const policySector = isPolicySectorValue(sectorRaw) ? sectorRaw : "";

  const qRaw = sp.get("q")?.trim() ?? "";
  const q = qRaw.length > MAX_Q_LEN ? qRaw.slice(0, MAX_Q_LEN) : qRaw;

  return {
    memberSlug: sp.get("memberSlug")?.trim().toLowerCase() ?? "",
    partySlug: sp.get("partySlug")?.trim().toLowerCase() ?? "",
    electionCycle: sp.get("electionCycle")?.trim() ?? "",
    governmentOnly,
    policySector,
    status,
    q,
  };
}
