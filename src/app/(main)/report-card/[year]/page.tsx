import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { MetricsDisplay } from "@/components/accountability/MetricsDisplay";
import { PageHeader } from "@/components/ui/PageHeader";
import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { getCachedPublishedReportCardYear } from "@/lib/server/accountability-cache";
import { isReportCardPublicEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ year: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year: raw } = await params;
  const year = Number.parseInt(raw, 10);
  if (!isReportCardPublicEnabled() || !isDatabaseConfigured() || !Number.isFinite(year)) {
    return { title: "Report card" };
  }
  const cycle = await getCachedPublishedReportCardYear(year);
  return {
    title: cycle ? `Report card ${year}` : "Report card",
    description: cycle?.label,
  };
}

export default async function ReportCardYearPage({ params }: Props) {
  if (!isReportCardPublicEnabled() || !isDatabaseConfigured()) notFound();

  const { year: raw } = await params;
  const year = Number.parseInt(raw, 10);
  if (!Number.isFinite(year) || year < 1992 || year > 2100) notFound();

  const cycle = await getCachedPublishedReportCardYear(year);

  if (!cycle) notFound();

  return (
    <div>
      <PageHeader
        title={`${cycle.year} — ${cycle.label}`}
        description="Summaries and scores below are published for this cycle. They do not replace official oversight."
        breadcrumbCurrentLabel={String(cycle.year)}
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/report-card" className={primaryNavLinkClass}>
              ← All cycles
            </Link>
          </p>
          {cycle.methodology?.trim() ? (
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--muted-foreground)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
                Cycle methodology
              </p>
              <p className="mt-2 whitespace-pre-wrap">{cycle.methodology.trim()}</p>
            </div>
          ) : null}

          {cycle.entries.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--muted-foreground)]">No entries in this cycle yet.</p>
          ) : (
            <ul className="mt-8 space-y-6">
              {cycle.entries.map((e) => (
                <li
                  key={e.id}
                  className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                        {e.member.name}
                      </h2>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {e.member.role}
                        {e.member.party ? ` · ${e.member.party}` : ""}
                      </p>
                    </div>
                    {e.overallScore != null ? (
                      <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-sm font-semibold text-[var(--primary)]">
                        {e.overallScore}
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--muted)]/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        Score pending
                      </span>
                    )}
                  </div>
                  {e.narrative ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
                      {e.narrative}
                    </p>
                  ) : null}
                  {e.metrics != null ? (
                    <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--section-light)]/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        Metrics
                      </p>
                      <div className="mt-2">
                        <MetricsDisplay value={e.metrics} />
                      </div>
                    </div>
                  ) : null}
                  {e.member._count.promises > 0 ? (
                    <p className="mt-3 text-xs">
                      <Link href={`/promises/${encodeURIComponent(e.member.slug)}`} className={primaryLinkClass}>
                        {accountabilityProse.mpPledgeSheetLink}
                      </Link>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
