import { describe, expect, it } from "vitest";

import { buildHomeHeroGlanceStats } from "@/lib/home-hero-glance-stats";
import type { HomeAtAGlanceData } from "@/lib/home-at-a-glance-types";
import type { PromiseTrackerStats } from "@/lib/promise-tracker-public-types";

describe("buildHomeHeroGlanceStats", () => {
  const emptyAtAGlance: HomeAtAGlanceData = {
    petitions: null,
    publicCauses: null,
    communities: null,
    townHalls: null,
    reportCard: null,
    voiceTotals: null,
  };

  it("includes live impact metrics when available", () => {
    const stats = buildHomeHeroGlanceStats(
      { ...emptyAtAGlance, voiceTotals: { totalReports: 1200 } },
      { totalPromises: 340 } as PromiseTrackerStats,
    );
    expect(stats[0]).toEqual({ value: "1,200", label: "Citizen reports received" });
    expect(stats[1]).toEqual({ value: "340", label: "Commitments tracked" });
    expect(stats[2]).toEqual({ value: "100%", label: "Non-partisan" });
    expect(stats[3]).toEqual({ value: "16", label: "Regions of Ghana", href: "#ghana-regions" });
  });

  it("falls back to trust and geography when no live totals exist", () => {
    const stats = buildHomeHeroGlanceStats(emptyAtAGlance, null);
    expect(stats).toEqual([
      { value: "100%", label: "Non-partisan" },
      { value: "16", label: "Regions of Ghana", href: "#ghana-regions" },
    ]);
  });
});
