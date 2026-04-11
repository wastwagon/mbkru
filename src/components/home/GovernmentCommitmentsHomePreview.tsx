"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { PromiseTrackerStatsStrip } from "@/components/accountability/PromiseTrackerStatsStrip";
import type { GovernmentCommitmentsHomePreview as GovPreviewData } from "@/lib/home-government-preview-types";
import { PROMISE_LIST_STATUS_LABELS } from "@/lib/promise-list-filters";

type Props = {
  data: GovPreviewData;
};

function statusLabel(status: string): string {
  if (status in PROMISE_LIST_STATUS_LABELS) {
    return PROMISE_LIST_STATUS_LABELS[status as keyof typeof PROMISE_LIST_STATUS_LABELS];
  }
  return status.replace(/_/g, " ").toLowerCase();
}

export function GovernmentCommitmentsHomePreview({ data }: Props) {
  const { stats, rows } = data;

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
            Government commitments tracker
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            Same live catalogue and filters as{" "}
            <Link href="/government-commitments" className="font-semibold text-[var(--primary)] hover:underline">
              Government commitments
            </Link>{" "}
            — executive- and programme-tagged pledges sourced like other promise rows.
          </p>
        </motion.div>

        <PromiseTrackerStatsStrip
          stats={stats}
          compact
          subtitle="Counts and status mix use the same government-only scope as the full tracker page."
        />

        {rows.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-3">
              <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Recent rows</h3>
              <Link
                href="/government-commitments"
                className="text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Open full tracker →
              </Link>
            </div>
            <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/40">
              {rows.map((row) => (
                <li key={row.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug text-[var(--foreground)]">{row.title}</p>
                    {row.member ? (
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        <span className="font-medium text-[var(--foreground)]/80">{row.member.name}</span>
                        {" · "}
                        <Link href={`/promises/${encodeURIComponent(row.member.slug)}`} className="text-[var(--primary)] hover:underline">
                          MP pledge sheet
                        </Link>
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                    {statusLabel(row.status)}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            No government-tagged rows in the catalogue yet. Editors can tag pledges from Admin → Parliament.
          </p>
        )}
      </div>
    </section>
  );
}
