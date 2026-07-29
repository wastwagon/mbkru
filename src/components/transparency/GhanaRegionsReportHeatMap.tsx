"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useMemo, useState } from "react";

import {
  HEAT_LEGEND_STOPS,
  heatFillColor,
  heatIntensityPercent,
  normalizeHeatIntensity,
} from "@/lib/viz/heat-scale";
import { GHANA_REGION_MAP_PATHS, GHANA_REGION_MAP_VIEWBOX } from "@/lib/geo/ghana-region-map-paths.generated";
import { ghanaRegionSlugFromDisplayName } from "@/lib/geo/ghana-region-slug";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type RegionCount = { regionName: string; regionSlug: string; count: number };

type Props = {
  regions: RegionCount[];
  /** Emphasise one region (e.g. on `/regions/[slug]`). */
  highlightSlug?: string;
};

export function GhanaRegionsReportHeatMap({ regions, highlightSlug }: Props) {
  const router = useRouter();
  const [hover, setHover] = useState<{ name: string; count: number; slug: string } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const countByName = useMemo(() => {
    const map = new Map<string, RegionCount>();
    for (const r of regions) map.set(r.regionName, r);
    return map;
  }, [regions]);

  const maxCount = useMemo(() => Math.max(1, ...regions.map((r) => r.count)), [regions]);
  const totalTagged = useMemo(() => regions.reduce((sum, r) => sum + r.count, 0), [regions]);
  const regionTotal = Object.keys(GHANA_REGION_MAP_PATHS).length;

  const rankedRegions = useMemo(() => {
    const known = Object.keys(GHANA_REGION_MAP_PATHS).map((name) => {
      const row = countByName.get(name);
      const count = row?.count ?? 0;
      return {
        regionName: name,
        regionSlug: row?.regionSlug || ghanaRegionSlugFromDisplayName(name) || "",
        count,
        intensityPct: heatIntensityPercent(count, maxCount),
        sharePct: totalTagged > 0 ? Math.round((count / totalTagged) * 1000) / 10 : 0,
      };
    });
    return known.sort((a, b) => b.count - a.count || a.regionName.localeCompare(b.regionName));
  }, [countByName, maxCount, totalTagged]);

  const regionsWithData = rankedRegions.filter((r) => r.count > 0).length;
  const topRegion = rankedRegions[0]?.count ? rankedRegions[0] : null;

  function setActive(name: string, count: number, slug: string) {
    setHover({ name, count, slug });
  }

  function clearActive() {
    setHover(null);
  }

  function goToRegion(slug: string | undefined) {
    if (!slug) return;
    router.push(`/regions/${encodeURIComponent(slug)}`);
  }

  function onRegionKeyDown(e: KeyboardEvent, slug: string | undefined) {
    if (!slug) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToRegion(slug);
    }
  }

  const activeName = hover?.name ?? focused;
  const active = activeName
    ? {
        name: activeName,
        count: countByName.get(activeName)?.count ?? 0,
        slug: countByName.get(activeName)?.regionSlug || ghanaRegionSlugFromDisplayName(activeName) || "",
        intensityPct: heatIntensityPercent(countByName.get(activeName)?.count ?? 0, maxCount),
      }
    : null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Reports by region</h3>
          <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
            Intensity is relative to the busiest region ({totalTagged} tagged report
            {totalTagged === 1 ? "" : "s"} across {regionsWithData} of {regionTotal} regions). Activate a region
            (click or Enter) for its programme page.
          </p>
          {topRegion ? (
            <p className="mt-2 text-xs text-[var(--foreground-secondary)]">
              Highest volume:{" "}
              <span className="font-semibold text-[var(--foreground)]">{topRegion.regionName}</span> (
              {topRegion.count})
            </p>
          ) : null}
        </div>
        <div
          className="flex flex-wrap items-center gap-2 text-xs text-[var(--foreground-secondary)]"
          role="group"
          aria-label="Heat map intensity legend: none, low, mid, high"
        >
          {HEAT_LEGEND_STOPS.map((stop) => (
            <span key={stop.label} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-5 rounded-sm ring-1 ring-black/5" style={{ background: stop.color }} aria-hidden />
              {stop.label}
            </span>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {active
          ? `${active.name}: ${active.count} reports, intensity ${active.intensityPct} percent.`
          : "No region selected."}
      </p>

      <div className="relative mx-auto mt-6 max-w-md">
        <svg
          viewBox={GHANA_REGION_MAP_VIEWBOX}
          className="h-auto w-full touch-manipulation"
          role="group"
          aria-label="Ghana regional report heat map. Tab between regions and press Enter to open a programme page. A full data table follows."
        >
          <title>Ghana — Voice reports by region</title>
          {Object.entries(GHANA_REGION_MAP_PATHS).map(([name, d]) => {
            const row = countByName.get(name);
            const count = row?.count ?? 0;
            const intensity = normalizeHeatIntensity(count, maxCount);
            const fill = heatFillColor(intensity, count > 0);
            const slug = row?.regionSlug || ghanaRegionSlugFromDisplayName(name);
            const isHover = activeName === name;
            const isHighlight = Boolean(highlightSlug && slug === highlightSlug);
            const intensityPct = heatIntensityPercent(count, maxCount);
            const label = `${name}: ${count} report${count === 1 ? "" : "s"}, intensity ${intensityPct}%`;

            return (
              <path
                key={name}
                data-region={name}
                d={d}
                fill={fill}
                stroke={
                  isHighlight ? "rgb(180, 83, 9)" : isHover ? "rgb(13, 118, 110)" : "rgba(15, 23, 42, 0.32)"
                }
                strokeWidth={isHighlight ? 2.2 : isHover ? 1.6 : 0.85}
                className={
                  slug
                    ? "cursor-pointer transition-[fill,stroke-width] duration-150 outline-none focus-visible:stroke-[rgb(13,118,110)] focus-visible:stroke-[2.4]"
                    : ""
                }
                tabIndex={slug ? 0 : undefined}
                role={slug ? "link" : undefined}
                aria-label={slug ? `${label}. Open ${name} programme page` : label}
                onMouseEnter={() => setActive(name, count, slug ?? "")}
                onMouseLeave={clearActive}
                onFocus={() => {
                  setFocused(name);
                  setActive(name, count, slug ?? "");
                }}
                onBlur={() => {
                  setFocused(null);
                  clearActive();
                }}
                onKeyDown={(e) => onRegionKeyDown(e, slug)}
                onClick={() => goToRegion(slug)}
              >
                <title>{label}</title>
              </path>
            );
          })}
        </svg>

        {active ? (
          <div
            className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-slate-900/95 px-3 py-2 text-center text-xs text-white shadow-lg"
            aria-hidden
          >
            <p className="font-semibold">{active.name}</p>
            <p className="mt-0.5 tabular-nums text-slate-300">
              {active.count} report{active.count === 1 ? "" : "s"} · {active.intensityPct}% intensity
            </p>
          </div>
        ) : null}
      </div>

      {rankedRegions.some((r) => r.count > 0) ? (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">
              All Ghana regions with Voice report counts, share of tagged reports, and relative intensity. Sorted by
              count descending. Hover a row to highlight the map.
            </caption>
            <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--foreground-secondary)]">
              <tr>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Region
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold tabular-nums">
                  Reports
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold tabular-nums">
                  Share
                </th>
                <th scope="col" className="py-2 text-right font-semibold tabular-nums">
                  Intensity
                </th>
              </tr>
            </thead>
            <tbody>
              {rankedRegions.map((r) => {
                const isRowActive = activeName === r.regionName;
                return (
                  <tr
                    key={r.regionName}
                    className={`border-b border-[var(--border)]/70 last:border-0 ${
                      isRowActive ? "bg-[var(--primary)]/6" : ""
                    }`}
                    onMouseEnter={() => setActive(r.regionName, r.count, r.regionSlug)}
                    onMouseLeave={clearActive}
                  >
                    <th scope="row" className="py-2 pr-3 font-medium text-[var(--foreground)]">
                      {r.regionSlug ? (
                        <Link href={`/regions/${encodeURIComponent(r.regionSlug)}`} className={primaryLinkClass}>
                          {r.regionName}
                        </Link>
                      ) : (
                        r.regionName
                      )}
                    </th>
                    <td className="py-2 pr-3 text-right font-semibold tabular-nums text-[var(--primary)]">
                      {r.count}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--foreground-secondary)]">
                      {r.count > 0 ? `${r.sharePct}%` : "—"}
                    </td>
                    <td className="py-2 text-right">
                      <span className="inline-flex items-center justify-end gap-2 tabular-nums text-[var(--foreground-secondary)]">
                        <span
                          className="h-2.5 w-8 rounded-sm ring-1 ring-black/5"
                          style={{
                            background: heatFillColor(normalizeHeatIntensity(r.count, maxCount), r.count > 0),
                          }}
                          aria-hidden
                        />
                        {r.count > 0 ? `${r.intensityPct}%` : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--foreground-secondary)]">
          No region-tagged reports yet — counts will appear as members include location on submissions.
        </p>
      )}
    </div>
  );
}
