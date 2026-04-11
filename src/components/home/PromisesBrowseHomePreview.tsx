"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { PromisesBrowseLive } from "@/components/accountability/PromisesBrowseLive";
import type { PromisesBrowseHomePreview as BrowsePreviewData } from "@/lib/home-promises-browse-preview-types";

type Props = {
  data: BrowsePreviewData;
};

/** Homepage block — same live catalogue + stats pattern as `/promises/browse`, styled like Government commitments preview. */
export function PromisesBrowseHomePreview({ data }: Props) {
  const { stats, initialRows } = data;

  return (
    <section
      id="promises-browse-dashboard"
      className="section-full border-b border-[var(--border)] bg-white py-10 sm:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Live catalogue</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
            Promises browse dashboard
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            Same live search, filters, and rows as{" "}
            <Link href="/promises/browse" className="font-semibold text-[var(--primary)] hover:underline">
              Browse promises
            </Link>{" "}
            — full accountability catalogue on this site (server-rendered data, same as the full page).
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8"
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
              <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-3">
                <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Filters &amp; results</h3>
                <Link href="/promises/browse" className="text-sm font-semibold text-[var(--primary)] hover:underline">
                  Open full browse page →
                </Link>
              </div>
            }
          />
        </motion.div>
      </div>
    </section>
  );
}
