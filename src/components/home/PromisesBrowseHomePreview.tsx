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
import type { PromisesBrowseHomePreview as BrowsePreviewData } from "@/lib/home-promises-browse-preview-types";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";

type Props = {
  data: BrowsePreviewData;
};

/** Homepage block — same live catalogue + stats pattern as `/promises/browse`, styled like Government commitments preview. */
export function PromisesBrowseHomePreview({ data }: Props) {
  const { stats, initialRows } = data;
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="promises-browse-dashboard"
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Live catalogue</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:mt-4 sm:text-3xl">
            {accountabilityHomePreviewCopy.browseHeading}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            {accountabilityHomePreviewCopy.browseLead}{" "}
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises} className={`${primaryLinkClass} font-semibold`}>
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
            mode="browse"
            initialStats={stats}
            initialRows={initialRows}
            initialQ=""
            initialSector={undefined}
            initialStatus={undefined}
            initialGovernmentOnly={false}
            initialPartySlug={undefined}
            initialElectionCycle={undefined}
            initialConstituencySlug=""
            trackerConstituencies={data.trackerConstituencies}
            csvExportHref="/api/export/promises-csv"
            filterToolbarHeader={
              <div className="mt-6 space-y-3 border-b border-[var(--border)] pb-3 sm:mt-8">
                <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-left">
                  {accountabilityHomePreviewCopy.promiseCardSurfaceExplainer}
                </p>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Filters &amp; results</h3>
                  <Link
                    href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises}
                    className={`${primaryNavLinkClass} text-sm font-semibold`}
                  >
                    Open full browse page →
                  </Link>
                </div>
              </div>
            }
          />
        </motion.div>
      </div>
    </section>
  );
}
