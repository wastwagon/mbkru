import type { PromiseTrackerStats } from "@/lib/promise-tracker-public-types";
import type { PublicPromiseApiRow } from "@/lib/public-promise-api-row";

export type PromisesBrowseHomePreview = {
  stats: PromiseTrackerStats;
  initialRows: PublicPromiseApiRow[];
};
