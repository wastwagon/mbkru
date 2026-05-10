import Link from "next/link";
import { redirect } from "next/navigation";
import type { CitizenReportKind } from "@prisma/client";

import { ReportCardBrowseCard } from "@/components/accountability/ReportCardBrowseCard";
import { VoiceSubmissionBrowseCard } from "@/components/accountability/VoiceSubmissionBrowseCard";
import { ReportCardVoiceFiltersForm } from "@/components/accountability/ReportCardVoiceFiltersForm";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { publicReportCardCycleTitle } from "@/lib/report-card-public-label";
import { regionalReportCardIndexHref } from "@/lib/regional-report-card-hrefs";
import {
  isCivicPetitionsAndPublicCausesEnabled,
  isReportCardPublicEnabled,
} from "@/lib/reports/accountability-pages";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { VOICE_SUBMISSION_KIND_FILTERS } from "@/lib/reports/voice-submission-kind-filters";
import {
  getCachedPublishedReportCardCycles,
  getReportCardBrowseEntries,
  getVoiceSubmissionsBrowseEntries,
  REPORT_CARD_INDEX_PAGE_SIZE,
  VOICE_SUBMISSIONS_BROWSE_PAGE_SIZE,
} from "@/lib/server/accountability-cache";

export async function RegionReportCardsSection({
  regionSlug,
  regionId,
  regionName,
  searchParams,
}: {
  regionSlug: string;
  regionId: string;
  regionName: string;
  searchParams: Promise<{
    year?: string;
    q?: string;
    page?: string;
    vq?: string;
    vpage?: string;
    vkind?: string;
  }>;
}) {
  if (!isDatabaseConfigured()) return null;

  const showScores = isReportCardPublicEnabled();
  const voiceOn = isCitizensVoiceEnabled();
  if (!showScores && !voiceOn) return null;

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

  const selectedRegionId = regionId;
  const selectedVRegionId = regionId;

  const qRaw = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const vqRaw = typeof sp.vq === "string" ? sp.vq : "";
  const vPage = Math.max(1, Number.parseInt(sp.vpage ?? "1", 10) || 1);

  const vkindRaw = typeof sp.vkind === "string" ? sp.vkind.trim() : "";
  const normalizedVkind = vkindRaw.toUpperCase().replace(/-/g, "_");
  const voiceKindFilter: CitizenReportKind | null = VOICE_SUBMISSION_KIND_FILTERS.includes(
    normalizedVkind as CitizenReportKind,
  )
    ? (normalizedVkind as CitizenReportKind)
    : null;

  const voiceBrowse = voiceOn
    ? await getVoiceSubmissionsBrowseEntries({
        page: vPage,
        regionId: selectedVRegionId,
        q: vqRaw.trim() || null,
        kind: voiceKindFilter,
      })
    : { rows: [], totalFiltered: 0, page: 1 };

  const vTotalPages = Math.max(1, Math.ceil(voiceBrowse.totalFiltered / VOICE_SUBMISSIONS_BROWSE_PAGE_SIZE));
  if (voiceOn && voiceBrowse.totalFiltered > 0 && vPage > vTotalPages) {
    redirect(
      regionalReportCardIndexHref(regionSlug, {
        year: hasCycles ? selectedYear : undefined,
        region: selectedRegionId,
        q: qRaw.trim() || undefined,
        page: page > 1 ? page : undefined,
        vq: vqRaw.trim() || undefined,
        vregion: selectedVRegionId,
        vpage: vTotalPages,
        vkind: voiceKindFilter ?? undefined,
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
      regionalReportCardIndexHref(regionSlug, {
        year: selectedYear,
        region: selectedRegionId,
        q: qRaw.trim() || undefined,
        page: totalPages,
        vq: vqRaw.trim() || undefined,
        vregion: selectedVRegionId,
        vpage: vPage > 1 ? vPage : undefined,
        vkind: voiceKindFilter ?? undefined,
      }),
    );
  }

  const safePage = Math.min(browse.page, totalPages);
  const safeVPage = Math.min(voiceBrowse.page, vTotalPages);
  const cycleMeta = hasCycles ? cycles.find((c) => c.year === selectedYear) : undefined;

  const browseBase = `/regions/${regionSlug}`;

  return (
    <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-4xl rounded-2xl border border-[var(--primary)]/25 bg-gradient-to-br from-[var(--primary)]/10 to-white px-5 py-6 sm:px-8">
          <p className="font-display text-lg font-semibold text-[var(--foreground)]">
            People&apos;s Report Card — {regionName}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            Voice submissions and published programme scores below are filtered to this region only. Open the{" "}
            <Link href="/report-card" className={primaryNavLinkClass}>
              full Report Card index
            </Link>{" "}
            to browse every region.
          </p>
          <p className="mt-3 flex flex-wrap gap-x-2 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/methodology" className={primaryNavLinkClass}>
              Methodology
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp} className={primaryNavLinkClass}>
              {accountabilityCatalogueNavMedium.byMp}
            </Link>
          </p>
        </div>

        <p
          className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-[var(--muted-foreground)]"
          id="prc-disambiguation-regional"
        >
          {accountabilityProse.reportCardIndexDisambiguation}{" "}
          <Link href="/methodology#key-terms" className={primaryNavLinkClass}>
            Glossary
          </Link>
          .
        </p>

        {scorecardsMode ? (
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-[var(--muted-foreground)]">
            Pre-election programme framing is described in{" "}
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

        {voiceOn ? (
          <>
            <div
              id="browse-voice"
              className="mx-auto mt-10 max-w-5xl rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Reports submitted (MBKRU Voice) — {regionName}
              </p>
              <ReportCardVoiceFiltersForm
                regions={regions}
                preserve={{
                  hasCycles,
                  selectedYear,
                  selectedRegionId,
                  qRaw,
                  safePage,
                }}
                voice={{
                  vregion: selectedVRegionId,
                  vkind: voiceKindFilter ?? "",
                  vq: vqRaw,
                }}
                resetHref={browseBase}
                browseBasePath={browseBase}
                lockedVoiceRegion={{ id: regionId, name: regionName }}
              />
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Listed by most recent (excluding archived). Same filters as the main Report Card page, scoped to this region.
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
                  No submissions from this region match these filters yet.
                </p>
              ) : (
                <ul className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {voiceBrowse.rows.map((row) => (
                    <li key={row.id} className="flex min-h-0">
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
                        href={
                          regionalReportCardIndexHref(regionSlug, {
                            year: hasCycles ? selectedYear : undefined,
                            region: selectedRegionId,
                            q: qRaw.trim() || undefined,
                            page: page > 1 ? page : undefined,
                            vq: vqRaw.trim() || undefined,
                            vregion: selectedVRegionId,
                            vpage: safeVPage - 1,
                            vkind: voiceKindFilter ?? undefined,
                          }) + "#browse-voice"
                        }
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
                        href={
                          regionalReportCardIndexHref(regionSlug, {
                            year: hasCycles ? selectedYear : undefined,
                            region: selectedRegionId,
                            q: qRaw.trim() || undefined,
                            page: page > 1 ? page : undefined,
                            vq: vqRaw.trim() || undefined,
                            vregion: selectedVRegionId,
                            vpage: safeVPage + 1,
                            vkind: voiceKindFilter ?? undefined,
                          }) + "#browse-voice"
                        }
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

        {showScores && hasCycles ? (
          <>
            <div
              id="browse-scores"
              className="mx-auto mt-14 max-w-5xl rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Official programme scores (People&apos;s Report Card) — {regionName}
              </p>
              <form
                method="get"
                action={`${browseBase}#browse-scores`}
                className="mt-4 grid gap-4 lg:grid-cols-12 lg:items-end"
              >
                <input type="hidden" name="page" value="1" />
                <input type="hidden" name="vq" value={vqRaw} />
                <input type="hidden" name="vregion" value={selectedVRegionId} />
                <input type="hidden" name="vpage" value={String(safeVPage)} />
                <input type="hidden" name="vkind" value={voiceKindFilter ?? ""} />
                <input type="hidden" name="region" value={selectedRegionId} />
                <label className="lg:col-span-4">
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
                <label className="lg:col-span-5">
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
                <div className="flex flex-wrap gap-2 lg:col-span-3">
                  <button
                    type="submit"
                    className="min-h-[44px] flex-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-dark)]"
                  >
                    Apply
                  </button>
                  <Link
                    href={
                      regionalReportCardIndexHref(regionSlug, {
                        year: selectedYear,
                        vq: vqRaw.trim() || undefined,
                        vregion: selectedVRegionId,
                        vpage: vPage > 1 ? vPage : undefined,
                        vkind: voiceKindFilter ?? undefined,
                      }) + "#browse-scores"
                    }
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--section-light)]"
                  >
                    Reset
                  </Link>
                </div>
              </form>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Showing scores for <span className="font-medium text-[var(--foreground)]">{selectedYear}</span>
                {cycleMeta ? (
                  <>
                    {" "}
                    ({cycleMeta._count.entries} entr
                    {cycleMeta._count.entries === 1 ? "y" : "ies"} in this cycle)
                  </>
                ) : null}{" "}
                — region locked to {regionName}.
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
                  No programme entries for this region in this cycle. Try another year or clear search.
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
                        href={
                          regionalReportCardIndexHref(regionSlug, {
                            year: selectedYear,
                            region: selectedRegionId,
                            q: qRaw.trim() || undefined,
                            page: safePage - 1,
                            vq: vqRaw.trim() || undefined,
                            vregion: selectedVRegionId,
                            vpage: vPage > 1 ? vPage : undefined,
                            vkind: voiceKindFilter ?? undefined,
                          }) + "#browse-scores"
                        }
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
                        href={
                          regionalReportCardIndexHref(regionSlug, {
                            year: selectedYear,
                            region: selectedRegionId,
                            q: qRaw.trim() || undefined,
                            page: safePage + 1,
                            vq: vqRaw.trim() || undefined,
                            vregion: selectedVRegionId,
                            vpage: vPage > 1 ? vPage : undefined,
                            vkind: voiceKindFilter ?? undefined,
                          }) + "#browse-scores"
                        }
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
            No published programme cycles yet for scorecards.
          </div>
        ) : null}
      </div>
    </section>
  );
}
