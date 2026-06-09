import type { HomeAtAGlanceData } from "@/lib/home-at-a-glance-types";
import type { PromiseTrackerStats } from "@/lib/promise-tracker-public-types";

export type HomeHeroGlanceStat = {
  value: string;
  label: string;
  href?: string;
};

/** Impact-first hero metrics when live data exists; trust and geography otherwise. */
export function buildHomeHeroGlanceStats(
  atAGlance: HomeAtAGlanceData,
  accountabilityStats: PromiseTrackerStats | null | undefined,
): HomeHeroGlanceStat[] {
  const stats: HomeHeroGlanceStat[] = [];

  const reports = atAGlance.voiceTotals?.totalReports ?? 0;
  if (reports > 0) {
    stats.push({
      value: reports.toLocaleString("en-GH"),
      label: "Citizen reports received",
    });
  }

  const commitments = accountabilityStats?.totalPromises ?? 0;
  if (commitments > 0) {
    stats.push({
      value: commitments.toLocaleString("en-GH"),
      label: "Commitments tracked",
    });
  }

  stats.push({ value: "100%", label: "Non-partisan" });
  stats.push({ value: "16", label: "Regions of Ghana", href: "#ghana-regions" });

  return stats.slice(0, 4);
}
