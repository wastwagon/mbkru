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
    page?: string;
  }>;
};

function parseGovernmentOnlyFlag(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase() ?? "";
  return v === "1" || v === "true" || v === "on" || v === "yes";
}

export default async function PromisesBrowsePage({ searchParams }: Props) {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const sp = await searchParams;
  const sectorFilter = parsePromiseListSectorFilter(sp.sector);
  const statusFilter = parsePromiseListStatusFilter(sp.status);
  const q = parsePromiseListSearchQuery(sp.q);
  const governmentOnly = parseGovernmentOnlyFlag(sp.governmentOnly);
  const pageRequested = parsePromiseListPageIndex(sp.page);

  const where: Prisma.CampaignPromiseWhereInput = {
    memberId: { not: null },
    member: { is: { active: true } },
  };
  if (governmentOnly) where.isGovernmentProgramme = true;
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
      memberId: { not: null },
      member: { is: { active: true } },
    },
  });

  const hasActiveFilters = Boolean(
    sectorFilter || statusFilter || q.length > 0 || governmentOnly,
  );

  const hrefArgs = {
    q,
    sector: sectorFilter,
    status: statusFilter,
    governmentOnly,
  };

  return (
    <div>
      <PageHeader
        title="Browse promises"
        description="All documented commitments we track for active parliamentarians. Filter by category, status, or government-programme tag. Not every pledge exists online — we record what we can cite."
        breadcrumbCurrentLabel="Browse"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/promises" className="text-[var(--primary)] hover:underline">
              ← By MP
            </Link>
            {" · "}
            <Link href="/government-commitments" className="text-[var(--primary)] hover:underline">
              Government commitments
            </Link>
            {" · "}
            <Link href="/api/promises" className="text-[var(--primary)] hover:underline">
              JSON API
            </Link>
          </p>

          {totalUnfiltered > 0 ? (
            <PromiseListFilterForm
              idPrefix="browse"
              hrefClear="/promises/browse"
              q={q}
              sector={sectorFilter}
              status={statusFilter}
              hasActiveFilters={hasActiveFilters}
              showGovernmentOnlyToggle
              governmentOnlyChecked={governmentOnly}
            />
          ) : null}

          {promises.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
              {totalUnfiltered === 0
                ? "No promise records yet. Editors publish pledges in admin with sources and optional manifesto links."
                : "No promises match these filters. Try clearing or widening the search."}
            </p>
          ) : (
            <>
              <p className="mt-6 text-xs text-[var(--muted-foreground)]">
                Showing {(page - 1) * PROMISE_LIST_PAGE_SIZE + 1}–
                {(page - 1) * PROMISE_LIST_PAGE_SIZE + promises.length} of {totalMatching} (page {page} of{" "}
                {totalPages}). For machine-readable full exports use the{" "}
                <Link href="/api/export/promises-csv" className="text-[var(--primary)] hover:underline">
                  CSV export
                </Link>
                .
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
                            {p.isGovernmentProgramme ? (
                              <span className="ml-1 rounded-full bg-[var(--section-light)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--foreground)]">
                                Gov programme
                              </span>
                            ) : null}
                            {p.electionCycle ? (
                              <span className="text-[var(--muted-foreground)]"> · Cycle {p.electionCycle}</span>
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
                      href={buildPromiseListPageHref("/promises/browse", { ...hrefArgs, page: page - 1 })}
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
                      href={buildPromiseListPageHref("/promises/browse", { ...hrefArgs, page: page + 1 })}
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
