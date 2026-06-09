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

/** Single homepage accountability block — KPIs, sample rows, links to the hub and full catalogue. */
export function AccountabilityHomePreview({ data }: Props) {
  const { stats, initialRows, trackerConstituencies } = data;
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="accountability"
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
            {accountabilityHomePreviewCopy.accountabilityTeaserHeading}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--foreground-secondary)] sm:text-base">
            {accountabilityHomePreviewCopy.accountabilityTeaserLead}{" "}
            <Link href="/parliament-tracker" className={`${primaryLinkClass} font-semibold`}>
              Explore the accountability hub
            </Link>
            .
          </p>
          <p className="mt-3 text-sm text-[var(--foreground-secondary)]">
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments} className={primaryLinkClass}>
              Government commitments
            </Link>
            {" · "}
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises} className={primaryLinkClass}>
              All tracked commitments
            </Link>
            {" · "}
            <Link href="/methodology" className={primaryLinkClass}>
              How we cite sources
            </Link>
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
            homeTeaserMaxRows={3}
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
            homeTeaserCtaHref="/parliament-tracker"
            filterToolbarHeader={
              <div className="mt-6 space-y-2 border-b border-[var(--border)] pb-3 sm:mt-8">
                <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-[var(--foreground-secondary)] sm:text-left">
                  {accountabilityHomePreviewCopy.accountabilityTeaserCardHint}
                </p>
                <h3 className="text-center font-display text-base font-semibold text-[var(--foreground)] sm:text-left">
                  {accountabilityHomePreviewCopy.accountabilityTeaserRecentHeading}
                </h3>
              </div>
            }
          />
        </motion.div>
      </div>
    </section>
  );
}
