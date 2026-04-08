import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PromiseEvidenceCard } from "@/components/accountability/PromiseEvidenceCard";
import { PromiseListFilterForm } from "@/components/accountability/PromiseListFilterForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import {
  parsePromiseListSearchQuery,
  parsePromiseListSectorFilter,
  parsePromiseListStatusFilter,
} from "@/lib/promise-list-filters";
import {
  PROMISE_LIST_PAGE_SIZE,
  buildPromiseListPageHref,
  parsePromiseListPageIndex,
} from "@/lib/promise-list-pagination";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";

import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Government commitments",
  description:
    "Campaign promises tagged as government programmes or executive commitments — tracked alongside MP and minister pledges.",
};

type Props = { searchParams: Promise<{ sector?: string; status?: string; q?: string; page?: string }> };

export default async function GovernmentCommitmentsPage({ searchParams }: Props) {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const sp = await searchParams;
  const sectorFilter = parsePromiseListSectorFilter(sp.sector);
  const statusFilter = parsePromiseListStatusFilter(sp.status);
  const q = parsePromiseListSearchQuery(sp.q);
  const pageRequested = parsePromiseListPageIndex(sp.page);

  const where: Prisma.CampaignPromiseWhereInput = {
    isGovernmentProgramme: true,
    memberId: { not: null },
    member: { is: { active: true } },
  };
  if (sectorFilter) where.policySector = sectorFilter;
  if (statusFilter) where.status = statusFilter;
  if (q.length > 0) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const totalMatching = await prisma.campaignPromise.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalMatching / PROMISE_LIST_PAGE_SIZE));
  const page = Math.min(pageRequested, totalPages);

  const promises = await prisma.campaignPromise.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * PROMISE_LIST_PAGE_SIZE,
    take: PROMISE_LIST_PAGE_SIZE,
    include: {
      member: { select: { name: true, slug: true, role: true, party: true } },
      manifestoDocument: { select: { title: true, sourceUrl: true } },
    },
  });

  const totalUnfiltered = await prisma.campaignPromise.count({
    where: {
      isGovernmentProgramme: true,
      memberId: { not: null },
      member: { is: { active: true } },
    },
  });

  const hasActiveFilters = Boolean(sectorFilter || statusFilter || q.length > 0);

  const hrefArgs = { q, sector: sectorFilter, status: statusFilter };

  return (
    <div>
      <PageHeader
        title="Government commitments"
        description="Pledges we tag as government programmes or executive-track commitments. Each item remains sourced and status-tracked like other campaign promises — not a legal finding."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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
            <Link
              href="/api/promises?governmentOnly=true"
              className="text-[var(--primary)] hover:underline"
            >
              JSON (gov only)
            </Link>
          </p>

          {totalUnfiltered > 0 ? (
            <PromiseListFilterForm
              idPrefix="gov"
              hrefClear="/government-commitments"
              q={q}
              sector={sectorFilter}
              status={statusFilter}
              hasActiveFilters={hasActiveFilters}
            />
          ) : null}

          {promises.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
              {totalUnfiltered === 0
                ? "No government-programme commitments are published yet. Editors add them in admin and can link party manifestos (PDF URLs) there — we do not auto-scrape party sites."
                : "No commitments match these filters. Try clearing search or filters."}
            </p>
          ) : (
            <>
              <p className="mt-6 text-xs text-[var(--muted-foreground)]">
                Showing {(page - 1) * PROMISE_LIST_PAGE_SIZE + 1}–
                {(page - 1) * PROMISE_LIST_PAGE_SIZE + promises.length} of {totalMatching} (page {page} of{" "}
                {totalPages}).
              </p>
              <ul className="mt-4 space-y-6">
                {promises.map((p) => (
                  <li key={p.id}>
                    <PromiseEvidenceCard
                      title={p.title}
                      description={p.description}
                      status={p.status}
                      sourceLabel={p.sourceLabel}
                      sourceDate={p.sourceDate}
                      sourceUrl={p.sourceUrl}
                      verificationNotes={p.verificationNotes}
                      manifestoDocument={p.manifestoDocument}
                      policySector={p.policySector}
                      meta={
                        p.member ? (
                          <>
                            <Link
                              href={`/promises/${p.member.slug}`}
                              className="font-medium text-[var(--primary)] hover:underline"
                            >
                              {p.member.name}
                            </Link>
                            <span>
                              {" "}
                              · {p.member.role}
                              {p.member.party ? ` · ${p.member.party}` : ""}
                            </span>
                            {p.electionCycle ? (
                              <span className="text-[var(--muted-foreground)]"> · Cycle {p.electionCycle}</span>
                            ) : null}
                            {p.partySlug ? (
                              <span className="text-[var(--muted-foreground)]"> · Party {p.partySlug}</span>
                            ) : null}
                          </>
                        ) : null
                      }
                    />
                  </li>
                ))}
              </ul>
              {totalPages > 1 ? (
                <nav
                  className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between"
                  aria-label="Pagination"
                >
                  {page > 1 ? (
                    <Link
                      href={buildPromiseListPageHref("/government-commitments", {
                        ...hrefArgs,
                        page: page - 1,
                      })}
                      className="inline-flex justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--section-light)] sm:justify-start"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span className="inline-flex justify-center py-2 text-sm text-[var(--muted-foreground)] sm:justify-start">
                      ← Previous
                    </span>
                  )}
                  {page < totalPages ? (
                    <Link
                      href={buildPromiseListPageHref("/government-commitments", {
                        ...hrefArgs,
                        page: page + 1,
                      })}
                      className="inline-flex justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--section-light)] sm:justify-end"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span className="inline-flex justify-center py-2 text-sm text-[var(--muted-foreground)] sm:justify-end">
                      Next →
                    </span>
                  )}
                </nav>
              ) : null}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
