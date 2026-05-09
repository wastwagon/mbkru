import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { MetricsDisplay } from "@/components/accountability/MetricsDisplay";
import { PageHeader } from "@/components/ui/PageHeader";
import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { publicReportCardCycleTitle } from "@/lib/report-card-public-label";
import { getCachedPublishedReportCardYear } from "@/lib/server/accountability-cache";
import { isReportCardPublicEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

export const maxDuration = 60;

type Props = { params: Promise<{ year: string }> };
type SearchParams = { mp?: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year: raw } = await params;
  const year = Number.parseInt(raw, 10);
  if (!isReportCardPublicEnabled() || !isDatabaseConfigured() || !Number.isFinite(year)) {
    return { title: "Report card" };
  }
  const cycle = await getCachedPublishedReportCardYear(year);
  return {
    title: cycle ? `Report card ${year}` : "Report card",
    description: cycle ? publicReportCardCycleTitle(year, cycle.label) : undefined,
  };
}

export default async function ReportCardYearPage({
  params,
  searchParams,
}: Props & { searchParams: Promise<SearchParams> }) {
  if (!isReportCardPublicEnabled() || !isDatabaseConfigured()) notFound();

  const { year: raw } = await params;
  const { mp: selectedMpRaw } = await searchParams;
  const year = Number.parseInt(raw, 10);
  if (!Number.isFinite(year) || year < 1992 || year > 2100) notFound();

  const cycle = await getCachedPublishedReportCardYear(year);

  if (!cycle) notFound();

  const selectedMp = selectedMpRaw?.trim() || "";
  const members = cycle.entries
    .map((e) => ({ slug: e.member.slug, name: e.member.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const selectedExists = selectedMp
    ? members.some((m) => m.slug === selectedMp)
    : false;
  const filteredEntries = selectedMp
    ? cycle.entries.filter((e) => e.member.slug === selectedMp)
    : cycle.entries;
  const scoredEntries = cycle.entries.filter((e) => e.overallScore != null);
  const avgScore =
    scoredEntries.length > 0
      ? (scoredEntries.reduce((sum, e) => sum + (e.overallScore ?? 0), 0) / scoredEntries.length).toFixed(1)
      : null;
  const topScored = [...scoredEntries]
    .sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))
    .slice(0, 3);
  const publishedDateLabel = cycle.publishedAt
    ? cycle.publishedAt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "n/a";
  const sortedFilteredEntries = [...filteredEntries].sort((a, b) => {
    if (a.overallScore == null && b.overallScore == null) return a.member.name.localeCompare(b.member.name);
    if (a.overallScore == null) return 1;
    if (b.overallScore == null) return -1;
    return b.overallScore - a.overallScore;
  });

  return (
    <div>
      <PageHeader
        title={publicReportCardCycleTitle(cycle.year, cycle.label)}
        description="Summaries and scores below are published for this dated cycle — evidence that stacks toward evaluating MPs across the Parliament; they do not replace official oversight."
        breadcrumbCurrentLabel={String(cycle.year)}
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/report-card" className={primaryNavLinkClass}>
              ← All cycles
            </Link>
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted-foreground)]">
            <Link href="/methodology" className={primaryNavLinkClass}>
              Methodology
            </Link>
            <span aria-hidden className="text-[var(--muted-foreground)]/50">
              ·
            </span>
            <Link href={`/api/report-card/${cycle.year}`} className={primaryNavLinkClass}>
              Cycle JSON
            </Link>
            <span aria-hidden className="text-[var(--muted-foreground)]/50">
              ·
            </span>
            <span>
              Published:{" "}
              <span className="font-medium text-[var(--foreground)]">{publishedDateLabel}</span>
            </span>
          </p>
          {cycle.methodology?.trim() ? (
            <div className="mt-6 rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--muted-foreground)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
                Cycle methodology
              </p>
              <p className="mt-2 whitespace-pre-wrap">{cycle.methodology.trim()}</p>
            </div>
          ) : null}

          <div className="mt-6 rounded-xl border border-[var(--border)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cycle at a glance
            </p>
            <div className="mt-2 grid gap-2 text-sm text-[var(--muted-foreground)] sm:grid-cols-3">
              <p>
                Entries:{" "}
                <span className="font-semibold text-[var(--foreground)]">{cycle.entries.length}</span>
              </p>
              <p>
                Scored:{" "}
                <span className="font-semibold text-[var(--foreground)]">{scoredEntries.length}</span>
              </p>
              <p>
                Avg score:{" "}
                <span className="font-semibold text-[var(--foreground)]">{avgScore ?? "pending"}</span>
              </p>
            </div>
            {topScored.length > 0 ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Quick picks:{" "}
                {topScored.map((e, i) => (
                  <span key={e.id}>
                    {i > 0 ? " · " : ""}
                    <Link
                      prefetch={false}
                      href={`/report-card/${cycle.year}?mp=${encodeURIComponent(e.member.slug)}`}
                      className={primaryNavLinkClass}
                    >
                      {e.member.name}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border border-[var(--border)] bg-white p-4">
            <form method="get" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
              <label className="text-sm">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Filter by MP
                </span>
                <select
                  name="mp"
                  defaultValue={selectedExists ? selectedMp : ""}
                  className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
                >
                  <option value="">All MPs in this cycle</option>
                  {members.map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--section-light)]"
              >
                Apply
              </button>
              {selectedMp ? (
                <Link href={`/report-card/${cycle.year}`} className={`${primaryNavLinkClass} text-sm`}>
                  Clear
                </Link>
              ) : (
                <span />
              )}
            </form>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Showing {filteredEntries.length} of {cycle.entries.length} entr
              {cycle.entries.length === 1 ? "y" : "ies"} for {cycle.year}.
            </p>
            {selectedExists ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Selected MP: {members.find((m) => m.slug === selectedMp)?.name}
              </p>
            ) : null}
          </div>

          {filteredEntries.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--muted-foreground)]">No entries in this cycle yet.</p>
          ) : (
            <ul className="mt-8 space-y-6">
              {sortedFilteredEntries.map((e) => (
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
                  {(e.member._count?.promises ?? 0) > 0 ? (
                    <p className="mt-3 text-xs">
                      <Link
                        prefetch={false}
                        href={`/promises/${encodeURIComponent(e.member.slug)}`}
                        className={primaryLinkClass}
                      >
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
