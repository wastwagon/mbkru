import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { ghanaParliamentTermShortLabel } from "@/config/ghana-parliament-term";
import { publicReportCardCycleTitle } from "@/lib/report-card-public-label";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { focusRingInsetRowClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isReportCardPublicEnabled } from "@/lib/reports/accountability-pages";
import { getCachedPublishedReportCardCycles } from "@/lib/server/accountability-cache";

export const dynamic = "force-dynamic";

export const maxDuration = 60;

export const metadata: Metadata = {
  title: "People's Report Card",
  description:
    "Published People's Report Card cycles — MP narratives and scores by release year. Explanatory summaries, not legal or electoral findings.",
};

export default async function ReportCardIndexPage() {
  if (!isReportCardPublicEnabled() || !isDatabaseConfigured()) notFound();

  const phase = getServerPlatformPhase();
  const scorecardsMode = platformFeatures.accountabilityScorecards(phase);

  const cycles = await getCachedPublishedReportCardCycles();

  return (
    <div>
      <PageHeader
        title="People&apos;s Report Card"
        description="Published cycles combine MP narratives and scores for each release year. These are citizen-facing accountability summaries — not court judgments or electoral rulings. Methodology explains how we score and what limits apply."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {scorecardsMode ? (
            <p className="mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed text-[var(--muted-foreground)]">
              Our accountability programme also describes pre-election scorecard timing and engagement (including around
              elections). That roadmap is in{" "}
              <Link href="/methodology" className={primaryNavLinkClass}>
                methodology
              </Link>
              {platformFeatures.electionObservatory(phase) ? (
                <>
                  {" "}
                  — with links to the{" "}
                  <Link href="/election-observation" className={primaryNavLinkClass}>
                    election observation hub
                  </Link>
                </>
              ) : null}
              . It sits alongside — not instead of — the published People&apos;s Report Card cycles listed below.
            </p>
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
                  Each cycle is a People&apos;s Report Card release: MP-by-MP narratives, scores, and metrics. The year labels
                  the batch; evidence can stack across Ghana&apos;s four-year Parliament ({ghanaParliamentTermShortLabel()}) so
                  readers can see cumulative delivery toward the next general election.
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
                      {publicReportCardCycleTitle(c.year, c.label)}
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
