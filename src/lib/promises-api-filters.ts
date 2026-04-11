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
  /** Constituency slug (matches `Constituency.slug`) — filters promises via linked MP’s seat. */
  constituencySlug: string;
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

  const rawConst = sp.get("constituency")?.trim().toLowerCase() ?? "";
  const constituencySlug =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawConst) && rawConst.length <= 120 ? rawConst : "";

  return {
    memberSlug: sp.get("memberSlug")?.trim().toLowerCase() ?? "",
    constituencySlug,
    partySlug: sp.get("partySlug")?.trim().toLowerCase() ?? "",
    electionCycle: sp.get("electionCycle")?.trim() ?? "",
    governmentOnly,
    policySector,
    status,
    q,
  };
}

/** Unfiltered browse catalogue (no query params). */
export function defaultPromisesApiFilters(): PromisesApiFilters {
  return parsePromisesApiFilters(new URL("http://local/"));
}

/** Whether tracker KPIs differ from the page’s “wide open” default (for subtitle copy). */
export function promisesFiltersNarrowCatalogue(
  filters: PromisesApiFilters,
  mode: "browse" | "government",
): boolean {
  const row =
    Boolean(filters.constituencySlug) ||
    Boolean(filters.memberSlug) ||
    Boolean(filters.partySlug) ||
    Boolean(filters.electionCycle) ||
    Boolean(filters.policySector) ||
    Boolean(filters.status) ||
    Boolean(filters.q.trim());
  if (mode === "government") return row;
  return row || filters.governmentOnly;
}
