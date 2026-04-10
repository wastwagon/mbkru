import type { PromiseStatus } from "@prisma/client";

import { isPolicySectorValue } from "@/lib/promise-policy-sectors";

/** Status values allowed in public promise list filters (matches `PromiseStatus`). */
export const PROMISE_LIST_STATUS_FILTER = [
  "TRACKING",
  "IN_PROGRESS",
  "FULFILLED",
  "BROKEN",
  "DEFERRED",
] as const;

export const PROMISE_LIST_STATUS_LABELS: Record<
  (typeof PROMISE_LIST_STATUS_FILTER)[number],
  string
> = {
  TRACKING: "Tracking",
  IN_PROGRESS: "In progress",
  FULFILLED: "Fulfilled",
  BROKEN: "Broken",
  DEFERRED: "Deferred",
};

export function parsePromiseListStatusFilter(raw: string | undefined): PromiseStatus | undefined {
  const s = raw?.trim().toUpperCase() ?? "";
  if (!(PROMISE_LIST_STATUS_FILTER as readonly string[]).includes(s)) return undefined;
  return s as PromiseStatus;
}

export function parsePromiseListSectorFilter(raw: string | undefined): string | undefined {
  const s = raw?.trim().toUpperCase() ?? "";
  return isPolicySectorValue(s) ? s : undefined;
}

export function parsePromiseListSearchQuery(raw: string | undefined): string {
  return raw?.trim() ?? "";
}

/** Public promise list: filter by party slug on the promise row (e.g. ndc, npp). */
export function parsePromiseListPartySlug(raw: string | undefined): "ndc" | "npp" | undefined {
  const v = raw?.trim().toLowerCase() ?? "";
  if (v === "ndc" || v === "npp") return v;
  return undefined;
}

export function parsePromiseListElectionCycle(raw: string | undefined): string | undefined {
  const c = raw?.trim() ?? "";
  return c.length > 0 ? c : undefined;
}
