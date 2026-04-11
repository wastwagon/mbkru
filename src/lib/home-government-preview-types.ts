import type { PromiseTrackerStats } from "@/lib/promise-tracker-public-types";
import type { PublicPromiseApiRow } from "@/lib/public-promise-api-row";
import type { TrackerConstituencyOption } from "@/lib/tracker-constituency-public-types";

export type GovernmentCommitmentsHomePreview = {
  stats: PromiseTrackerStats;
  initialRows: PublicPromiseApiRow[];
  trackerConstituencies: TrackerConstituencyOption[];
};
