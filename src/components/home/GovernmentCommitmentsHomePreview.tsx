"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { PromisesBrowseLive } from "@/components/accountability/PromisesBrowseLive";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { sectionRevealTransition } from "@/lib/motion-reveal";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityHomePreviewCopy,
} from "@/config/accountability-catalogue-destinations";
import type { GovernmentCommitmentsHomePreview as GovPreviewData } from "@/lib/home-government-preview-types";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type Props = {
  data: GovPreviewData;
};

/** Homepage block — same KPIs as the full page, with a five-row preview and CTA to `/government-commitments`. */
export function GovernmentCommitmentsHomePreview({ data }: Props) {
  const { stats, initialRows, trackerConstituencies } = data;
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="government-commitments"
      className="section-full border-b border-[var(--border)] bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={sectionRevealTransition(reducedMotion)}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Accountability</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:mt-4 sm:text-3xl">
            {accountabilityHomePreviewCopy.governmentHeading}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            {accountabilityHomePreviewCopy.governmentLead}{" "}
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments} className={`${primaryLinkClass} font-semibold`}>
              Open full page
            </Link>
            .
          </p>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-32px 0px" }}
          transition={sectionRevealTransition(reducedMotion, 0.04)}
          className="mt-10 sm:mt-12"
        >
          <PromisesBrowseLive
            mode="government"
            homeTeaser
            homeTeaserMaxRows={5}
            initialStats={stats}
            initialRows={initialRows}
            initialQ=""
            initialSector={undefined}
            initialStatus={undefined}
            initialGovernmentOnly
            initialPartySlug={undefined}
            initialElectionCycle={undefined}
            initialConstituencySlug=""
            trackerConstituencies={trackerConstituencies}
            csvExportHref="/api/export/promises-csv"
            statsStripCompact
            homeTeaserCtaHref={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments}
            filterToolbarHeader={
              <div className="mt-6 space-y-2 border-b border-[var(--border)] pb-3 sm:mt-8">
                <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-left">
                  {accountabilityHomePreviewCopy.promiseCardSurfaceExplainerShort}
                </p>
                <h3 className="text-center font-display text-base font-semibold text-[var(--foreground)] sm:text-left">
                  Preview (five rows)
                </h3>
                <p className="text-center text-xs text-[var(--muted-foreground)] sm:text-left">
                  Open the full page for the interactive dashboard, search, and export.
                </p>
              </div>
            }
          />
        </motion.div>
      </div>
    </section>
  );
}
