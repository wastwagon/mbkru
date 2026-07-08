import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { evaluateLaunchReadiness } from "@/lib/server/launch-readiness";

const baseInput = {
  underConstructionDb: true,
  underConstructionEnvOverride: false,
  trainingReports: 0,
  publishedPendingScores: 0,
  incompleteCatalogueCommitments: 0,
  filterActive: true,
  citationFilterActive: true,
  hubtelProductionReady: false,
  isProduction: true,
  legalReviewSignedOff: false,
  backupDrillComplete: false,
};

describe("evaluateLaunchReadiness", () => {
  it("treats env override as gate on", () => {
    const r = evaluateLaunchReadiness({
      ...baseInput,
      underConstructionDb: false,
      underConstructionEnvOverride: true,
    });
    expect(r.underConstruction).toBe(true);
    expect(r.checks.find((c) => c.id === "construction-gate")?.status).toBe("ok");
  });

  it("flags open gate as attention before launch", () => {
    const r = evaluateLaunchReadiness({
      ...baseInput,
      underConstructionDb: false,
      underConstructionEnvOverride: false,
    });
    expect(r.checks.find((c) => c.id === "construction-gate")?.status).toBe("warn");
    expect(r.readyForLaunch).toBe(false);
  });

  it("blocks when published cycles lack scores", () => {
    const r = evaluateLaunchReadiness({ ...baseInput, publishedPendingScores: 1 });
    expect(r.blockerCount).toBeGreaterThanOrEqual(1);
    expect(r.checks.find((c) => c.id === "report-card-scores")?.status).toBe("blocker");
  });

  it("warns on training reports when filter hides them", () => {
    const r = evaluateLaunchReadiness({ ...baseInput, trainingReports: 12, filterActive: true });
    expect(r.checks.find((c) => c.id === "training-reports")?.status).toBe("warn");
  });

  it("is not ready while gate is on even if no blockers", () => {
    const r = evaluateLaunchReadiness(baseInput);
    expect(r.blockerCount).toBe(0);
    expect(r.readyForLaunch).toBe(false);
  });
});
