import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PromiseTrackerStatsStrip } from "@/components/accountability/PromiseTrackerStatsStrip";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getCachedPublishedReportCardCycles } from "@/lib/server/accountability-cache";
import { isReportCardPublicEnabled } from "@/lib/reports/accountability-pages";
import { getPromiseTrackerStats } from "@/lib/server/promise-tracker-stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "People's Report Card",
  description: "Published accountability cycles — summaries and scores where MBKRU has released a cycle.",
};

export default async function ReportCardIndexPage() {
  if (!isReportCardPublicEnabled() || !isDatabaseConfigured()) notFound();

  const phase = getServerPlatformPhase();
  const scorecardsMode = platformFeatures.accountabilityScorecards(phase);

  const [cycles, trackerStats] = await Promise.all([
    getCachedPublishedReportCardCycles(),
    getPromiseTrackerStats("all"),
  ]);

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
              <p className="mt-3 text-sm">
                <Link href="/methodology" className="font-medium text-[var(--primary)] hover:underline">
                  Read methodology
                </Link>
                {platformFeatures.electionObservatory(phase) ? (
                  <>
                    {" · "}
                    <Link href="/election-observation" className="font-medium text-[var(--primary)] hover:underline">
                      Election observation hub
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
          ) : null}
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/methodology" className="text-[var(--primary)] hover:underline">
              Methodology
            </Link>
            {" · "}
            <Link href="/promises" className="text-[var(--primary)] hover:underline">
              Campaign promises
            </Link>
            {" · "}
            <Link href="/parliament-tracker" className="text-[var(--primary)] hover:underline">
              Accountability hub
            </Link>
          </p>

          <PromiseTrackerStatsStrip
            stats={trackerStats}
            subtitle="Cross-links promises, MPs, and published scorecard rows — same aggregates as the promise browser."
          />

          {cycles.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
              No published cycles yet.
            </p>
          ) : (
            <ul className="mt-10 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
              {cycles.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/report-card/${c.year}`}
                    className="block px-4 py-4 transition-colors hover:bg-[var(--section-light)]/60"
                  >
                    <p className="font-display text-lg font-semibold text-[var(--foreground)]">{c.year}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{c.label}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {c._count.entries} entr{c._count.entries === 1 ? "y" : "ies"} →
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
