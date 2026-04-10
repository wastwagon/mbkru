import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PromisesBrowseLive } from "@/components/accountability/PromisesBrowseLive";
import { PromiseTrackerStatsStrip } from "@/components/accountability/PromiseTrackerStatsStrip";
import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { parsePromisesApiFilters } from "@/lib/promises-api-filters";
import {
  parsePromiseListElectionCycle,
  parsePromiseListPartySlug,
  parsePromiseListSearchQuery,
  parsePromiseListSectorFilter,
  parsePromiseListStatusFilter,
} from "@/lib/promise-list-filters";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";
import { getCachedPromisesApiRows } from "@/lib/server/accountability-cache";
import { getPromiseTrackerStats } from "@/lib/server/promise-tracker-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse campaign promises",
  description:
    "Search and filter documented MP and minister commitments — by category, status, and government programme tag.",
};

type Props = {
  searchParams: Promise<{
    sector?: string;
    status?: string;
    q?: string;
    governmentOnly?: string;
    partySlug?: string;
    electionCycle?: string;
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
}): URL {
  const u = new URL("http://local/");
  const q = parsePromiseListSearchQuery(sp.q);
  const sector = parsePromiseListSectorFilter(sp.sector);
  const status = parsePromiseListStatusFilter(sp.status);
  const party = parsePromiseListPartySlug(sp.partySlug);
  const cycle = parsePromiseListElectionCycle(sp.electionCycle);
  if (q) u.searchParams.set("q", q);
  if (sector) u.searchParams.set("policySector", sector);
  if (status) u.searchParams.set("status", status);
  if (party) u.searchParams.set("partySlug", party);
  if (cycle) u.searchParams.set("electionCycle", cycle);
  if (parseGovernmentOnlyFlag(sp.governmentOnly)) u.searchParams.set("governmentOnly", "true");
  return u;
}

export default async function PromisesBrowsePage({ searchParams }: Props) {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const sp = await searchParams;
  const sectorFilter = parsePromiseListSectorFilter(sp.sector);
  const statusFilter = parsePromiseListStatusFilter(sp.status);
  const q = parsePromiseListSearchQuery(sp.q);
  const governmentOnly = parseGovernmentOnlyFlag(sp.governmentOnly);
  const partySlug = parsePromiseListPartySlug(sp.partySlug);
  const electionCycle = parsePromiseListElectionCycle(sp.electionCycle);

  const filters = parsePromisesApiFilters(buildApiUrl(sp));
  const initialRows = await getCachedPromisesApiRows(filters);
  const stats = await getPromiseTrackerStats("all");

  return (
    <div>
      <PageHeader
        title="Browse promises"
        description="All documented commitments we track for active parliamentarians. Filters update results as you type. Not every pledge exists online — we record what we can cite."
        breadcrumbCurrentLabel="Browse"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/promises" className="text-[var(--primary)] hover:underline">
              ← By MP
            </Link>
            {" · "}
            <Link href="/government-commitments" className="text-[var(--primary)] hover:underline">
              Government commitments
            </Link>
            {" · "}
            <Link href="/parliament-tracker" className="text-[var(--primary)] hover:underline">
              Accountability hub
            </Link>
          </p>

          <PromiseTrackerStatsStrip stats={stats} />

          <PromisesBrowseLive
            mode="browse"
            initialRows={initialRows}
            initialQ={q}
            initialSector={sectorFilter}
            initialStatus={statusFilter}
            initialGovernmentOnly={governmentOnly}
            initialPartySlug={partySlug}
            initialElectionCycle={electionCycle}
            csvExportHref="/api/export/promises-csv"
          />
        </div>
      </section>
    </div>
  );
}
