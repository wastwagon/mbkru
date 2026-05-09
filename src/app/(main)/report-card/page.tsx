import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { focusRingInsetRowClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isReportCardPublicEnabled } from "@/lib/reports/accountability-pages";
import { getCachedPublishedReportCardCycles } from "@/lib/server/accountability-cache";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "People's Report Card",
  description: "Published accountability cycles — summaries and scores where MBKRU has released a cycle.",
};

function presentationCycleLabel(year: number, label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("pilot (layout & workflow)")) {
    return `People's Report Card ${year}`;
  }
  return label;
}

export default async function ReportCardIndexPage() {
  if (!isReportCardPublicEnabled() || !isDatabaseConfigured()) notFound();

  const phase = getServerPlatformPhase();
  const scorecardsMode = platformFeatures.accountabilityScorecards(phase);

  const cycles = await getCachedPublishedReportCardCycles();

  return (
    <div>
      <PageHeader
        title="People&apos;s Report Card"
        description="Published cycles only. Scores and narratives are explanatory — not legal or electoral findings. See methodology for our approach."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {scorecardsMode ? (
            <div className="mb-8 rounded-2xl border border-[var(--primary)]/25 bg-[var(--primary)]/5 px-4 py-4 text-center sm:px-6">
              <p className="text-sm font-semibold text-[var(--foreground)]">Pre-election accountability scorecards</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                This deployment highlights flagship scorecard cycles in the run-up to general elections. Narratives remain
                explanatory — see methodology for scope and limitations.
              </p>
              <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm">
                <Link
                  href="/methodology"
                  className={primaryNavLinkClass}
                >
                  Read methodology
                </Link>
                {platformFeatures.electionObservatory(phase) ? (
                  <>
                    <span className="text-[var(--muted-foreground)]/50" aria-hidden>
                      ·
                    </span>
                    <Link
                      href="/election-observation"
                      className={primaryNavLinkClass}
                    >
                      Election observation hub
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
          ) : null}
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-[var(--muted-foreground)]">
            <Link
              href="/methodology"
              className={primaryNavLinkClass}
            >
              Methodology
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link
              href={ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp}
              className={primaryNavLinkClass}
            >
              {accountabilityCatalogueNavMedium.byMp}
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link
              href="/parliament-tracker"
              className={primaryNavLinkClass}
            >
              Accountability hub
            </Link>
          </p>
          <p
            className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-[var(--muted-foreground)]"
            id="prc-disambiguation"
          >
            {accountabilityProse.reportCardIndexDisambiguation}{" "}
            <Link href="/methodology#key-terms" className={primaryNavLinkClass}>
              Glossary
            </Link>
            .
          </p>

          {cycles.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
              No published cycles yet.
            </p>
          ) : (
            <>
              <div className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Published cycles
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Open a cycle to see MP-by-MP narratives, scores, and metrics. Use the year page filter for individual MPs.
                </p>
                <p className="mt-3 text-sm">
                  <Link href={`/report-card/${cycles[0]?.year}`} className={primaryNavLinkClass}>
                    Open latest published cycle
                  </Link>
                </p>
              </div>
              <ul className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
              {cycles.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/report-card/${c.year}`}
                    className={`block min-h-[4.5rem] px-4 py-4 touch-manipulation transition-colors hover:bg-[var(--section-light)]/60 ${focusRingInsetRowClass}`}
                  >
                    <p className="font-display text-lg font-semibold text-[var(--foreground)]">{c.year}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {presentationCycleLabel(c.year, c.label)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {c._count.entries} entr{c._count.entries === 1 ? "y" : "ies"} →
                    </p>
                  </Link>
                </li>
              ))}
              </ul>
            </>
          )}

          <aside
            className={`mt-10 rounded-2xl border border-[var(--border)] bg-white px-4 py-5 sm:px-6`}
            aria-label="Where to find the commitment catalogue"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {accountabilityProse.reportCardCatalogueBridgeTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {accountabilityProse.reportCardCatalogueBridgeBody}
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
              <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises} className={primaryNavLinkClass}>
                {accountabilityCatalogueNavMedium.browseAll}
              </Link>
              <span className="text-[var(--muted-foreground)]/50" aria-hidden>
                ·
              </span>
              <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments} className={primaryNavLinkClass}>
                {accountabilityCatalogueNavMedium.government}
              </Link>
              <span className="text-[var(--muted-foreground)]/50" aria-hidden>
                ·
              </span>
              <Link href="/parliament-tracker" className={primaryNavLinkClass}>
                Accountability hub
              </Link>
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
