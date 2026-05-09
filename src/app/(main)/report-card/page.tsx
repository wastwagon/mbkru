import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { ReportCardBrowseCard } from "@/components/accountability/ReportCardBrowseCard";
import { VoiceSubmissionBrowseCard } from "@/components/accountability/VoiceSubmissionBrowseCard";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { ghanaParliamentTermShortLabel } from "@/config/ghana-parliament-term";
import { publicReportCardCycleTitle } from "@/lib/report-card-public-label";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { focusRingInsetRowClass, primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import {
  isCivicPetitionsAndPublicCausesEnabled,
  isReportCardPublicEnabled,
} from "@/lib/reports/accountability-pages";
import {
  getCachedPublishedReportCardCycles,
  getReportCardBrowseEntries,
  getVoiceSubmissionsBrowseEntries,
  REPORT_CARD_INDEX_PAGE_SIZE,
  VOICE_SUBMISSIONS_BROWSE_PAGE_SIZE,
} from "@/lib/server/accountability-cache";

export const dynamic = "force-dynamic";

export const maxDuration = 120;

export const metadata: Metadata = {
  title: "People's Report Card",
  description:
    "Browse MBKRU Voice submissions and published People's Report Card programme scores — filter by region or search, track reports, and read public threads when staff publish them.",
};

type ReportCardIndexQuery = {
  year?: number;
  region?: string;
  q?: string;
  page?: number;
  vq?: string;
  vregion?: string;
  vpage?: number;
};

function reportCardIndexHref(opts: ReportCardIndexQuery) {
  const sp = new URLSearchParams();
  if (opts.year != null) sp.set("year", String(opts.year));
  if (opts.region?.trim()) sp.set("region", opts.region.trim());
  if (opts.q?.trim()) sp.set("q", opts.q.trim());
  if (opts.page != null && opts.page > 1) sp.set("page", String(opts.page));
  if (opts.vq?.trim()) sp.set("vq", opts.vq.trim());
  if (opts.vregion?.trim()) sp.set("vregion", opts.vregion.trim());
  if (opts.vpage != null && opts.vpage > 1) sp.set("vpage", String(opts.vpage));
  const qs = sp.toString();
  return qs ? `/report-card?${qs}` : "/report-card";
}

export default async function ReportCardIndexPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    region?: string;
    q?: string;
    page?: string;
    vq?: string;
    vregion?: string;
    vpage?: string;
  }>;
}) {
  if (!isDatabaseConfigured()) notFound();

  const showScores = isReportCardPublicEnabled();
  const voiceOn = isCitizensVoiceEnabled();
  if (!showScores && !voiceOn) notFound();

  const sp = await searchParams;
  const phase = getServerPlatformPhase();
  const scorecardsMode = platformFeatures.accountabilityScorecards(phase);

  const cycles = showScores ? await getCachedPublishedReportCardCycles() : [];
  const hasCycles = cycles.length > 0;

  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const yearParsed = Number.parseInt(sp.year ?? "", 10);
  const selectedYear =
    hasCycles && Number.isFinite(yearParsed) && cycles.some((c) => c.year === yearParsed)
      ? yearParsed
      : hasCycles
        ? cycles[0].year
        : new Date().getFullYear();

  const regionParam = sp.region?.trim() ?? "";
  const selectedRegionId = regions.some((r) => r.id === regionParam) ? regionParam : "";

  const qRaw = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const vqRaw = typeof sp.vq === "string" ? sp.vq : "";
  const vRegionParam = sp.vregion?.trim() ?? "";
  const selectedVRegionId = regions.some((r) => r.id === vRegionParam) ? vRegionParam : "";
  const vPage = Math.max(1, Number.parseInt(sp.vpage ?? "1", 10) || 1);

  const voiceBrowse = voiceOn
    ? await getVoiceSubmissionsBrowseEntries({
        page: vPage,
        regionId: selectedVRegionId || null,
        q: vqRaw.trim() || null,
      })
    : { rows: [], totalFiltered: 0, page: 1 };

  const vTotalPages = Math.max(1, Math.ceil(voiceBrowse.totalFiltered / VOICE_SUBMISSIONS_BROWSE_PAGE_SIZE));
  if (voiceOn && voiceBrowse.totalFiltered > 0 && vPage > vTotalPages) {
    redirect(
      reportCardIndexHref({
        year: hasCycles ? selectedYear : undefined,
        region: selectedRegionId || undefined,
        q: qRaw.trim() || undefined,
        page: page > 1 ? page : undefined,
        vq: vqRaw.trim() || undefined,
        vregion: selectedVRegionId || undefined,
        vpage: vTotalPages,
      }),
    );
  }

  const browse =
    hasCycles && showScores
      ? await getReportCardBrowseEntries({
          year: selectedYear,
          page,
          regionId: selectedRegionId || null,
          q: qRaw.trim() || null,
        })
      : { rows: [], totalFiltered: 0, page: 1 };

  const totalPages = Math.max(1, Math.ceil(browse.totalFiltered / REPORT_CARD_INDEX_PAGE_SIZE));
  if (hasCycles && showScores && browse.totalFiltered > 0 && page > totalPages) {
    redirect(
      reportCardIndexHref({
        year: selectedYear,
        region: selectedRegionId || undefined,
        q: qRaw.trim() || undefined,
        page: totalPages,
        vq: vqRaw.trim() || undefined,
        vregion: selectedVRegionId || undefined,
        vpage: vPage > 1 ? vPage : undefined,
      }),
    );
  }

  const safePage = Math.min(browse.page, totalPages);
  const safeVPage = Math.min(voiceBrowse.page, vTotalPages);
  const cycleMeta = hasCycles ? cycles.find((c) => c.year === selectedYear) : undefined;

  const headerDescription =
    voiceOn && showScores
      ? "Browse MBKRU Voice submissions first (titles and public threads when published). Below that, open official programme scores by cycle where MBKRU has published them — summaries are not court or electoral findings."
      : voiceOn && !showScores
        ? "Browse MBKRU Voice submissions — titles and staff-approved public summaries when a thread is opened. Full narrative text stays with staff and the submitter unless published as a cause."
        : "Browse published MP and office-holder scores and narratives by cycle. Filter by region or name, open a full card for detail, or send structured feedback through MBKRU Voice.";

  return (
    <div>
      <PageHeader title="People&apos;s Report Card" description={headerDescription} />

      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Citizen submissions CTA */}
          <div className="mx-auto mb-10 max-w-4xl rounded-2xl border border-[var(--primary)]/25 bg-gradient-to-br from-[var(--primary)]/10 to-white px-5 py-6 sm:px-8">
            <p className="font-display text-lg font-semibold text-[var(--foreground)]">Your observations matter</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Report MP performance, government delivery, situational issues, or election observations. Staff triage every
              submission; you receive a tracking code.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {voiceOn ? (
                <Link
                  href="/citizens-voice/submit"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition hover:bg-[var(--primary-dark)]"
                >
                  Submit a report (MBKRU Voice)
                </Link>
              ) : (
                <span className="text-sm text-[var(--muted-foreground)]">Voice submissions are not enabled on this deployment.</span>
              )}
              <Link
                href="/track-report"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--section-light)]"
              >
                Track a report
              </Link>
              <Link
                href="/methodology"
                className={`inline-flex min-h-[44px] items-center ${primaryNavLinkClass} px-1 py-2 text-sm font-semibold`}
              >
                Methodology
              </Link>
            </div>
          </div>

          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/methodology" className={primaryNavLinkClass}>
              Methodology
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp} className={primaryNavLinkClass}>
              {accountabilityCatalogueNavMedium.byMp}
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link href="/parliament-tracker" className={primaryNavLinkClass}>
              Accountability hub
            </Link>
          </p>

          {scorecardsMode ? (
            <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-[var(--muted-foreground)]">
              Pre-election programme framing (including around elections) is described in{" "}
              <Link href="/methodology" className={primaryNavLinkClass}>
                methodology
              </Link>
              {platformFeatures.electionObservatory(phase) ? (
                <>
                  {" "}
                  and the{" "}
                  <Link href="/election-observation" className={primaryNavLinkClass}>
                    election observation hub
                  </Link>
                </>
              ) : null}
              .
            </p>
          ) : null}

          <p
            className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-[var(--muted-foreground)]"
            id="prc-disambiguation"
          >
            {accountabilityProse.reportCardIndexDisambiguation}{" "}
            <Link href="/methodology#key-terms" className={primaryNavLinkClass}>
              Glossary
            </Link>
            .
          </p>

          {/* Voice submissions — primary grid */}
          {voiceOn ? (
            <>
              <div
                id="browse-voice"
                className="mx-auto mt-10 max-w-5xl rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Reports submitted (MBKRU Voice)
                </p>
                <form method="get" action="/report-card#browse-voice" className="mt-4 grid gap-4 lg:grid-cols-12 lg:items-end">
                  <input type="hidden" name="vpage" value="1" />
                  {hasCycles ? <input type="hidden" name="year" value={selectedYear} /> : null}
                  <input type="hidden" name="region" value={selectedRegionId} />
                  <input type="hidden" name="q" value={qRaw} />
                  <input type="hidden" name="page" value={safePage} />
                  <label className="lg:col-span-4">
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Region</span>
                    <select
                      name="vregion"
                      defaultValue={selectedVRegionId}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)]"
                    >
                      <option value="">All regions</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="lg:col-span-6">
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Search title</span>
                    <input
                      type="search"
                      name="vq"
                      defaultValue={vqRaw}
                      placeholder="Words from the submission title"
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70"
                      autoComplete="off"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 lg:col-span-2">
                    <button
                      type="submit"
                      className="min-h-[44px] flex-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-dark)]"
                    >
                      Apply
                    </button>
                    <Link
                      href={reportCardIndexHref({
                        year: hasCycles ? selectedYear : undefined,
                        region: selectedRegionId || undefined,
                        q: qRaw.trim() || undefined,
                        page: page > 1 ? page : undefined,
                      })}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--section-light)]"
                    >
                      Reset
                    </Link>
                  </div>
                </form>
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  Listed by most recent. Archived submissions are hidden. Public threads show an editor-approved summary (not the
                  full private narrative).
                </p>
              </div>

              <div className="mx-auto mt-8 max-w-6xl">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    <span className="font-semibold text-[var(--foreground)]">{voiceBrowse.totalFiltered}</span> submission
                    {voiceBrowse.totalFiltered === 1 ? "" : "s"}
                    {voiceBrowse.totalFiltered > 0 ? (
                      <>
                        {" "}
                        · Page {safeVPage} of {vTotalPages} ({VOICE_SUBMISSIONS_BROWSE_PAGE_SIZE} per page)
                      </>
                    ) : null}
                  </p>
                  {isCivicPetitionsAndPublicCausesEnabled() ? (
                    <Link href="/citizens-voice/causes" className={`text-sm ${primaryNavLinkClass}`} prefetch={false}>
                      Public causes index →
                    </Link>
                  ) : null}
                </div>

                {voiceBrowse.rows.length === 0 ? (
                  <p className="rounded-2xl border border-[var(--border)] bg-white px-6 py-12 text-center text-sm text-[var(--muted-foreground)]">
                    No submissions match these filters yet — or none have been received.{" "}
                    <Link href="/citizens-voice/submit" className={primaryNavLinkClass}>
                      Submit a report
                    </Link>{" "}
                    to appear in this list (archived rows stay hidden).
                  </p>
                ) : (
                  <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {voiceBrowse.rows.map((row) => (
                      <li key={row.id}>
                        <VoiceSubmissionBrowseCard row={row} />
                      </li>
                    ))}
                  </ul>
                )}

                {vTotalPages > 1 ? (
                  <nav
                    className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between"
                    aria-label="Voice submissions pagination"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Page {safeVPage} of {vTotalPages}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {safeVPage > 1 ? (
                        <Link
                          href={reportCardIndexHref({
                            year: hasCycles ? selectedYear : undefined,
                            region: selectedRegionId || undefined,
                            q: qRaw.trim() || undefined,
                            page: page > 1 ? page : undefined,
                            vq: vqRaw.trim() || undefined,
                            vregion: selectedVRegionId || undefined,
                            vpage: safeVPage - 1,
                          })}
                          className={`${primaryNavLinkClass} font-semibold`}
                          prefetch={false}
                        >
                          ← Previous
                        </Link>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">← Previous</span>
                      )}
                      {safeVPage < vTotalPages ? (
                        <Link
                          href={reportCardIndexHref({
                            year: hasCycles ? selectedYear : undefined,
                            region: selectedRegionId || undefined,
                            q: qRaw.trim() || undefined,
                            page: page > 1 ? page : undefined,
                            vq: vqRaw.trim() || undefined,
                            vregion: selectedVRegionId || undefined,
                            vpage: safeVPage + 1,
                          })}
                          className={`${primaryNavLinkClass} font-semibold`}
                          prefetch={false}
                        >
                          Next →
                        </Link>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">Next →</span>
                      )}
                    </div>
                  </nav>
                ) : null}
              </div>
            </>
          ) : null}

          {/* Official programme scores */}
          {showScores && hasCycles ? (
            <>
              <div
                id="browse-scores"
                className="mx-auto mt-14 max-w-5xl rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Official programme scores (People&apos;s Report Card)
                </p>
                <form method="get" action="/report-card#browse-scores" className="mt-4 grid gap-4 lg:grid-cols-12 lg:items-end">
                  <input type="hidden" name="page" value="1" />
                  <input type="hidden" name="vq" value={vqRaw} />
                  <input type="hidden" name="vregion" value={selectedVRegionId} />
                  <input type="hidden" name="vpage" value={String(safeVPage)} />
                  <label className="lg:col-span-3">
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Cycle (year)</span>
                    <select
                      name="year"
                      defaultValue={selectedYear}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)]"
                    >
                      {cycles.map((c) => (
                        <option key={c.id} value={c.year}>
                          {c.year} — {publicReportCardCycleTitle(c.year, c.label)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="lg:col-span-3">
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Region</span>
                    <select
                      name="region"
                      defaultValue={selectedRegionId}
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)]"
                    >
                      <option value="">All regions</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="lg:col-span-4">
                    <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                      Search office-holder name
                    </span>
                    <input
                      type="search"
                      name="q"
                      defaultValue={qRaw}
                      placeholder="e.g. surname or first name"
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70"
                      autoComplete="off"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 lg:col-span-2">
                    <button
                      type="submit"
                      className="min-h-[44px] flex-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-dark)]"
                    >
                      Apply
                    </button>
                    <Link
                      href={reportCardIndexHref({
                        year: selectedYear,
                        vq: vqRaw.trim() || undefined,
                        vregion: selectedVRegionId || undefined,
                        vpage: vPage > 1 ? vPage : undefined,
                      })}
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--section-light)]"
                    >
                      Reset
                    </Link>
                  </div>
                </form>
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  Showing scores for{" "}
                  <span className="font-medium text-[var(--foreground)]">{selectedYear}</span>
                  {cycleMeta ? (
                    <>
                      {" "}
                      ({cycleMeta._count.entries} entr
                      {cycleMeta._count.entries === 1 ? "y" : "ies"} in this cycle)
                    </>
                  ) : null}
                  . Role labels follow the roster (MP, President, etc.).
                </p>
              </div>

              <div className="mx-auto mt-8 max-w-6xl">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    <span className="font-semibold text-[var(--foreground)]">{browse.totalFiltered}</span> match
                    {browse.totalFiltered === 1 ? "" : "es"}
                    {browse.totalFiltered > 0 ? (
                      <>
                        {" "}
                        · Page {safePage} of {totalPages} ({REPORT_CARD_INDEX_PAGE_SIZE} per page)
                      </>
                    ) : null}
                  </p>
                  <Link href={`/report-card/${selectedYear}`} className={`text-sm ${primaryNavLinkClass}`} prefetch={false}>
                    Open full cycle view →
                  </Link>
                </div>

                {browse.rows.length === 0 ? (
                  <p className="rounded-2xl border border-[var(--border)] bg-white px-6 py-12 text-center text-sm text-[var(--muted-foreground)]">
                    No programme entries match these filters. Try clearing search, choosing another region, or another cycle year.
                  </p>
                ) : (
                  <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {browse.rows.map((row) => (
                      <li key={row.id}>
                        <ReportCardBrowseCard year={selectedYear} row={row} />
                      </li>
                    ))}
                  </ul>
                )}

                {totalPages > 1 ? (
                  <nav
                    className="mt-10 flex flex-col gap-3 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between"
                    aria-label="Programme scores pagination"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Page {safePage} of {totalPages}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {safePage > 1 ? (
                        <Link
                          href={reportCardIndexHref({
                            year: selectedYear,
                            region: selectedRegionId || undefined,
                            q: qRaw.trim() || undefined,
                            page: safePage - 1,
                            vq: vqRaw.trim() || undefined,
                            vregion: selectedVRegionId || undefined,
                            vpage: vPage > 1 ? vPage : undefined,
                          })}
                          className={`${primaryNavLinkClass} font-semibold`}
                          prefetch={false}
                        >
                          ← Previous
                        </Link>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">← Previous</span>
                      )}
                      {safePage < totalPages ? (
                        <Link
                          href={reportCardIndexHref({
                            year: selectedYear,
                            region: selectedRegionId || undefined,
                            q: qRaw.trim() || undefined,
                            page: safePage + 1,
                            vq: vqRaw.trim() || undefined,
                            vregion: selectedVRegionId || undefined,
                            vpage: vPage > 1 ? vPage : undefined,
                          })}
                          className={`${primaryNavLinkClass} font-semibold`}
                          prefetch={false}
                        >
                          Next →
                        </Link>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">Next →</span>
                      )}
                    </div>
                  </nav>
                ) : null}
              </div>
            </>
          ) : showScores && !hasCycles ? (
            <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[var(--border)] bg-white px-6 py-10 text-center text-sm text-[var(--muted-foreground)]">
              No published programme cycles yet. Voice submissions appear above when Voice is enabled.
            </div>
          ) : null}

          {/* Published cycles compact list */}
          {hasCycles ? (
            <div className="mx-auto mt-14 max-w-3xl">
              <p className="text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                All published cycles
              </p>
              <ul className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
                {cycles.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/report-card/${c.year}`}
                      className={`block min-h-[4rem] px-4 py-4 touch-manipulation transition-colors hover:bg-[var(--section-light)]/60 ${focusRingInsetRowClass}`}
                    >
                      <p className="font-display text-lg font-semibold text-[var(--foreground)]">{c.year}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{publicReportCardCycleTitle(c.year, c.label)}</p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {c._count.entries} entr{c._count.entries === 1 ? "y" : "ies"} · detailed table view
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
                Ghana&apos;s four-year Parliament term: {ghanaParliamentTermShortLabel()}. Evidence can stack across cycles
                toward the next election.
              </p>
            </div>
          ) : null}

          <aside
            className={`mx-auto mt-12 max-w-3xl rounded-2xl border border-[var(--border)] bg-white px-4 py-5 sm:px-6`}
            aria-label="Commitment catalogue"
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
