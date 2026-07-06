import "server-only";

import { isPublicUnderConstructionEnvOverride } from "@/lib/construction-gate-env";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import {
  excludeTrainingDataFromPublicSurfaces,
  trainingCitizenReportsInDbWhere,
} from "@/lib/reports/training-data";
import {
  excludeIncompleteCitationsFromPublicPromotedSurfaces,
  incompleteCatalogueCommitmentsInDbWhere,
} from "@/lib/promises/incomplete-citations";
import { getHubtelGhanaCardConfig } from "@/lib/server/hubtel-ghana-card-config";
import { getPublicSiteConfig } from "@/lib/server/site-config";

export type LaunchCheckStatus = "ok" | "warn" | "blocker" | "manual";

export type LaunchCheck = {
  id: string;
  label: string;
  status: LaunchCheckStatus;
  detail: string;
  href?: string;
};

export type LaunchReadinessInput = {
  underConstructionDb: boolean;
  underConstructionEnvOverride: boolean;
  trainingReports: number;
  publishedPendingScores: number;
  incompleteCatalogueCommitments: number;
  filterActive: boolean;
  citationFilterActive: boolean;
  hubtelProductionReady: boolean | null;
  isProduction: boolean;
};

export type LaunchReadiness = {
  generatedAt: string;
  underConstruction: boolean;
  checks: LaunchCheck[];
  blockerCount: number;
  warnCount: number;
  readyForLaunch: boolean;
};

export function evaluateLaunchReadiness(input: LaunchReadinessInput): Omit<LaunchReadiness, "generatedAt"> {
  const underConstruction = input.underConstructionDb || input.underConstructionEnvOverride;
  const checks: LaunchCheck[] = [];

  checks.push({
    id: "construction-gate",
    label: "Public under-construction gate",
    status: underConstruction ? "ok" : "warn",
    detail: underConstruction
      ? input.underConstructionEnvOverride
        ? "Gate is ON (env override). Only admins can browse the full site."
        : "Gate is ON. Only admins can browse the full site."
      : "Gate is OFF — visitors can see the live site. Keep enabled until launch sign-off.",
    href: "/admin/settings#site-visibility",
  });

  checks.push({
    id: "training-filter",
    label: "Training-data filter (production)",
    status: !input.isProduction ? "ok" : input.filterActive ? "ok" : "blocker",
    detail: !input.isProduction
      ? "Filter inactive in non-production (expected for local training)."
      : input.filterActive
        ? "Demo/seed/Testing rows are hidden from public browse and stats."
        : "Filter is OFF in production — training rows may be visible when the gate opens.",
  });

  checks.push({
    id: "training-reports",
    label: "Demo/seed/test reports in database",
    status:
      input.trainingReports === 0 ? "ok" : input.filterActive ? "warn" : "blocker",
    detail:
      input.trainingReports === 0
        ? "No non-archived training reports remain."
        : `${input.trainingReports} training report(s) in DB. ${
            input.filterActive
              ? "Hidden from public by filter; archive before launch if desired."
              : "Will be public when the gate opens — archive in Admin → Reports or run ops:archive-training-reports."
          }`,
    href: "/admin/reports",
  });

  checks.push({
    id: "report-card-scores",
    label: "Report Card cycles without scores",
    status: input.publishedPendingScores === 0 ? "ok" : "blocker",
    detail:
      input.publishedPendingScores === 0
        ? "No published cycle is missing scores."
        : `${input.publishedPendingScores} published cycle(s) have entries but no scored rows. Unpublish or complete editorial sign-off before launch.`,
    href: "/admin/report-card",
  });

  checks.push({
    id: "catalogue-citations",
    label: "Incomplete manifesto catalogue citations",
    status: input.incompleteCatalogueCommitments === 0 ? "ok" : "warn",
    detail:
      input.incompleteCatalogueCommitments === 0
        ? "All catalogue seed rows have page refs and citation dates."
        : `${input.incompleteCatalogueCommitments} catalogue row(s) missing page ref or citation date. ${
            input.citationFilterActive
              ? "Hidden from homepage preview by filter; complete in admin before launch."
              : "Complete editorial sign-off in admin before promoting commitments."
          }`,
    href: "/admin/parliament",
  });

  if (input.isProduction) {
    checks.push({
      id: "hubtel",
      label: "Hubtel Ghana Card (production)",
      status: input.hubtelProductionReady ? "ok" : "warn",
      detail: input.hubtelProductionReady
        ? "Production Hubtel credentials are configured (not mock mode)."
        : "Set HUBTEL_CLIENT_ID and HUBTEL_CLIENT_SECRET — do not use HUBTEL_GHANA_CARD_MOCK=1 in production.",
    });
  } else {
    checks.push({
      id: "hubtel",
      label: "Hubtel Ghana Card verification",
      status: "manual",
      detail: "Configure and test Ghana Card verify on /account before promoting MP performance reporting.",
    });
  }

  checks.push({
    id: "legal-review",
    label: "Legal review (Privacy / Terms / Voice)",
    status: "manual",
    detail: "Record counsel sign-off before external accountability claims.",
  });

  checks.push({
    id: "backups",
    label: "Backup + restore drill",
    status: "manual",
    detail: "Run npm run ops:backup and ops:restore-verify; confirm admin login works on scratch DB.",
  });

  const blockerCount = checks.filter((c) => c.status === "blocker").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const manualOpen = checks.filter((c) => c.status === "manual").length;

  return {
    underConstruction,
    checks,
    blockerCount,
    warnCount,
    readyForLaunch: blockerCount === 0 && warnCount === 0 && manualOpen === 0 && !underConstruction,
  };
}

/**
 * Snapshot of pre-launch blockers for the admin Settings panel.
 * Automatable checks run against the database; legal and backups remain manual sign-offs.
 */
export async function getLaunchReadiness(): Promise<LaunchReadiness> {
  const generatedAt = new Date().toISOString();
  const isProduction = process.env.NODE_ENV === "production";

  if (!isDatabaseConfigured()) {
    const evaluated = evaluateLaunchReadiness({
      underConstructionDb: false,
      underConstructionEnvOverride: isPublicUnderConstructionEnvOverride(),
      trainingReports: 0,
      publishedPendingScores: 0,
      incompleteCatalogueCommitments: 0,
      filterActive: excludeTrainingDataFromPublicSurfaces(),
      citationFilterActive: excludeIncompleteCitationsFromPublicPromotedSurfaces(),
      hubtelProductionReady: null,
      isProduction,
    });
    return {
      generatedAt,
      ...evaluated,
      checks: [
        {
          id: "database",
          label: "Database configured",
          status: "blocker",
          detail: "DATABASE_URL is not set — cannot evaluate launch readiness.",
        },
        ...evaluated.checks,
      ],
      blockerCount: evaluated.blockerCount + 1,
      readyForLaunch: false,
    };
  }

  const config = await getPublicSiteConfig();
  const envOverride = isPublicUnderConstructionEnvOverride();

  const [trainingReports, incompleteCatalogueCommitments, publishedCycleRows] = await Promise.all([
    prisma.citizenReport.count({ where: trainingCitizenReportsInDbWhere() }),
    prisma.campaignPromise.count({ where: incompleteCatalogueCommitmentsInDbWhere() }),
    prisma.reportCardCycle.findMany({
      where: { publishedAt: { not: null } },
      select: { id: true, _count: { select: { entries: true } } },
    }),
  ]);

  let publishedPendingScores = 0;
  if (publishedCycleRows.length > 0) {
    const scoredByCycle = await prisma.scorecardEntry.groupBy({
      by: ["cycleId"],
      where: { overallScore: { not: null }, cycle: { publishedAt: { not: null } } },
      _count: { _all: true },
    });
    const cyclesWithScores = new Set(scoredByCycle.map((r) => r.cycleId));
    publishedPendingScores = publishedCycleRows.filter(
      (c) => c._count.entries > 0 && !cyclesWithScores.has(c.id),
    ).length;
  }

  const hubtel = isProduction ? getHubtelGhanaCardConfig() : null;
  const hubtelProductionReady =
    isProduction && hubtel ? !hubtel.mockMode : isProduction ? false : null;

  const evaluated = evaluateLaunchReadiness({
    underConstructionDb: config.publicUnderConstruction,
    underConstructionEnvOverride: envOverride,
    trainingReports,
    publishedPendingScores,
    incompleteCatalogueCommitments,
    filterActive: excludeTrainingDataFromPublicSurfaces(),
    citationFilterActive: excludeIncompleteCitationsFromPublicPromotedSurfaces(),
    hubtelProductionReady,
    isProduction,
  });

  return { generatedAt, ...evaluated };
}
