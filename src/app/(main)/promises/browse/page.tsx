import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PromiseCatalogueSurfacesCallout } from "@/components/accountability/PromiseCatalogueSurfacesCallout";
import { PromisesBrowseLive } from "@/components/accountability/PromisesBrowseLive";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityHomePreviewCopy,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { focusRingSmClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { parsePromisesApiFilters } from "@/lib/promises-api-filters";
import {
  parsePromiseListConstituencySlug,
  parsePromiseListElectionCycle,
  parsePromiseListPartySlug,
  parsePromiseListSearchQuery,
  parsePromiseListSectorFilter,
  parsePromiseListStatusFilter,
} from "@/lib/promise-list-filters";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";
import {
  getCachedPromiseTrackerStats,
  getCachedPromisesApiRows,
  getCachedTrackerConstituencies,
} from "@/lib/server/accountability-cache";

export const dynamic = "force-dynamic";

/** Catalogue page hits Postgres + cache; extend serverless budget where supported. */
export const maxDuration = 60;

type Props = {
  searchParams: Promise<{
    sector?: string;
    status?: string;
    q?: string;
    governmentOnly?: string;
    partySlug?: string;
    electionCycle?: string;
    constituency?: string;
  }>;
};

function parseGovernmentOnlyFlag(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase() ?? "";
  return v === "1" || v === "true" || v === "on" || v === "yes";
}

function buildApiUrl(sp: {
  sector?: string;
  status?: string;
  q?: string;
  governmentOnly?: string;
  partySlug?: string;
  electionCycle?: string;
  constituency?: string;
}): URL {
  const u = new URL("http://local/");
  const q = parsePromiseListSearchQuery(sp.q);
  const sector = parsePromiseListSectorFilter(sp.sector);
  const status = parsePromiseListStatusFilter(sp.status);
  const party = parsePromiseListPartySlug(sp.partySlug);
  const cycle = parsePromiseListElectionCycle(sp.electionCycle);
  const constituency = parsePromiseListConstituencySlug(sp.constituency);
  if (q) u.searchParams.set("q", q);
  if (sector) u.searchParams.set("policySector", sector);
  if (status) u.searchParams.set("status", status);
  if (party) u.searchParams.set("partySlug", party);
  if (cycle) u.searchParams.set("electionCycle", cycle);
  if (constituency) u.searchParams.set("constituency", constituency);
  if (parseGovernmentOnlyFlag(sp.governmentOnly)) u.searchParams.set("governmentOnly", "true");
  return u;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const governmentLens = parseGovernmentOnlyFlag(sp.governmentOnly);
  if (governmentLens) {
    return {
      title: accountabilityCatalogueNavMedium.government,
      description: accountabilityProse.governmentCommitmentsMetaDescription,
    };
  }
  return {
    title: accountabilityCatalogueNavMedium.browseAll,
    description:
      "Search and filter documented MP and minister commitments — by constituency, category, status, and government programme preset. One catalogue dashboard.",
  };
}

const lensPillBase =
  "inline-flex min-h-10 touch-manipulation items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition";
const lensInactive = "border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--section-light)]";
const lensActive =
  "border-[var(--primary)]/35 bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/20";

export default async function PromisesBrowsePage({ searchParams }: Props) {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const sp = await searchParams;
  const sectorFilter = parsePromiseListSectorFilter(sp.sector);
  const statusFilter = parsePromiseListStatusFilter(sp.status);
  const q = parsePromiseListSearchQuery(sp.q);
  const governmentOnly = parseGovernmentOnlyFlag(sp.governmentOnly);
  const partySlug = parsePromiseListPartySlug(sp.partySlug);
  const electionCycle = parsePromiseListElectionCycle(sp.electionCycle);
  const constituencySlug = parsePromiseListConstituencySlug(sp.constituency);

  const filters = parsePromisesApiFilters(buildApiUrl(sp));
  const [initialRows, stats, trackerConstituencies] = await Promise.all([
    getCachedPromisesApiRows(filters),
    getCachedPromiseTrackerStats(filters),
    getCachedTrackerConstituencies(),
  ]);

  const pageTitle = governmentOnly
    ? accountabilityCatalogueNavMedium.government
    : accountabilityCatalogueNavMedium.browseAll;

  const govDescription =
    "Programme- and executive-tagged pledges only. Same underlying rows as MP pledge sheets when a member is linked — one status everywhere. Use the catalogue switch below to widen to all sitting MPs.";

  const fullDescription =
    "All tracked commitments we publish for sitting parliamentarians unless you narrow filters. Toggle the government-programme preset for the executive slice — same dashboard, smarter filters.";

  return (
    <div>
      <PageHeader title={pageTitle} description={governmentOnly ? govDescription : fullDescription} />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mt-6 flex flex-wrap justify-center gap-3" role="tablist" aria-label="Catalogue presets">
            <Link
              href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises}
              className={`${lensPillBase} ${!governmentOnly ? lensActive : lensInactive} ${focusRingSmClass}`}
              prefetch={false}
            >
              Full catalogue
            </Link>
            <Link
              href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments}
              className={`${lensPillBase} ${governmentOnly ? lensActive : lensInactive} ${focusRingSmClass}`}
              prefetch={false}
            >
              Government programme lens
            </Link>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-center text-xs leading-relaxed text-[var(--muted-foreground)]">
            One interactive dashboard — filters below update the KPI strip and rows together.
          </p>

          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp} className={primaryNavLinkClass}>
              ← By MP roster
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link href="/parliament-tracker" className={primaryNavLinkClass}>
              Accountability hub
            </Link>
          </p>

          <PromiseCatalogueSurfacesCallout catalogueLens={governmentOnly ? "government" : "full"} />

          <p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-sm">
            {accountabilityHomePreviewCopy.promiseCardSurfaceExplainer}
          </p>

          <PromisesBrowseLive
            mode="browse"
            initialStats={stats}
            initialRows={initialRows}
            initialQ={q}
            initialSector={sectorFilter}
            initialStatus={statusFilter}
            initialGovernmentOnly={governmentOnly}
            initialPartySlug={partySlug}
            initialElectionCycle={electionCycle}
            initialConstituencySlug={constituencySlug}
            trackerConstituencies={trackerConstituencies}
            csvExportHref="/api/export/promises-csv"
          />
        </div>
      </section>
    </div>
  );
}
