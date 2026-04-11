import type { PromiseTrackerStats } from "@/lib/promise-tracker-public-types";

export type GovernmentCommitmentHomeRow = {
  id: string;
  title: string;
  status: string;
  member: { name: string; slug: string } | null;
};

export type GovernmentCommitmentsHomePreview = {
  stats: PromiseTrackerStats;
  rows: GovernmentCommitmentHomeRow[];
};
