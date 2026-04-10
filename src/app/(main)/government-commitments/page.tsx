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
  title: "Government commitments",
  description:
    "Campaign promises tagged as government programmes or executive commitments — tracked alongside MP and minister pledges.",
};

type Props = {
  searchParams: Promise<{ sector?: string; status?: string; q?: string; partySlug?: string; electionCycle?: string }>;
};

function buildApiUrl(sp: {
  sector?: string;
  status?: string;
  q?: string;
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
  u.searchParams.set("governmentOnly", "true");
  return u;
}

export default async function GovernmentCommitmentsPage({ searchParams }: Props) {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const sp = await searchParams;
  const sectorFilter = parsePromiseListSectorFilter(sp.sector);
  const statusFilter = parsePromiseListStatusFilter(sp.status);
  const q = parsePromiseListSearchQuery(sp.q);
  const partySlug = parsePromiseListPartySlug(sp.partySlug);
  const electionCycle = parsePromiseListElectionCycle(sp.electionCycle);

  const filters = parsePromisesApiFilters(buildApiUrl(sp));
  const initialRows = await getCachedPromisesApiRows(filters);
  const stats = await getPromiseTrackerStats("government");

  return (
    <div>
      <PageHeader
        title="Government commitments"
        description="Pledges we tag as government programmes or executive-track commitments. Each item remains sourced and status-tracked like other campaign promises — not a legal finding."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/promises" className="text-[var(--primary)] hover:underline">
              By MP
            </Link>
            {" · "}
            <Link href="/promises/browse" className="text-[var(--primary)] hover:underline">
              Browse all
            </Link>
            {" · "}
            <Link href="/methodology" className="text-[var(--primary)] hover:underline">
              Methodology
            </Link>
            {" · "}
            <Link href="/parliament-tracker" className="text-[var(--primary)] hover:underline">
              Accountability hub
            </Link>
          </p>

          <PromiseTrackerStatsStrip stats={stats} />

          <PromisesBrowseLive
            mode="government"
            initialRows={initialRows}
            initialQ={q}
            initialSector={sectorFilter}
            initialStatus={statusFilter}
            initialGovernmentOnly
            initialPartySlug={partySlug}
            initialElectionCycle={electionCycle}
            csvExportHref="/api/export/promises-csv"
          />
        </div>
      </section>
    </div>
  );
}
