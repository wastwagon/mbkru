"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { PromisesBrowseLive } from "@/components/accountability/PromisesBrowseLive";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityHomePreviewCopy,
} from "@/config/accountability-catalogue-destinations";
import type { GovernmentCommitmentsHomePreview as GovPreviewData } from "@/lib/home-government-preview-types";

type Props = {
  data: GovPreviewData;
};

/** Homepage block — same live filters and KPI strip as `/government-commitments`. */
export function GovernmentCommitmentsHomePreview({ data }: Props) {
  const { stats, initialRows, trackerConstituencies } = data;

  return (
    <section
      id="government-commitments"
      className="section-full border-b border-[var(--border)] bg-white py-10 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Accountability</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
            {accountabilityHomePreviewCopy.governmentHeading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            {accountabilityHomePreviewCopy.governmentLead}{" "}
            <Link
              href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments}
              className="font-semibold text-[var(--primary)] hover:underline"
            >
              Open full page
            </Link>
            .
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <PromisesBrowseLive
            mode="government"
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
            filterToolbarHeader={
              <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-3">
                <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Filters &amp; results</h3>
                <Link
                  href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments}
                  className="text-sm font-semibold text-[var(--primary)] hover:underline"
                >
                  Open full tracker →
                </Link>
              </div>
            }
          />
        </motion.div>
      </div>
    </section>
  );
}
