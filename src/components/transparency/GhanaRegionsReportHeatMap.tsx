"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { heatFillColor, normalizeHeatIntensity } from "@/lib/viz/heat-scale";
import { GHANA_REGION_MAP_PATHS, GHANA_REGION_MAP_VIEWBOX } from "@/lib/geo/ghana-region-map-paths.generated";
import { ghanaRegionsData } from "@/lib/site-content";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type RegionCount = { regionName: string; regionSlug: string; count: number };

type Props = {
  regions: RegionCount[];
};

export function GhanaRegionsReportHeatMap({ regions }: Props) {
  const router = useRouter();
  const [hover, setHover] = useState<{ name: string; count: number; slug: string } | null>(null);

  const countByName = useMemo(() => {
    const map = new Map<string, RegionCount>();
    for (const r of regions) map.set(r.regionName, r);
    return map;
  }, [regions]);

  const maxCount = useMemo(() => Math.max(1, ...regions.map((r) => r.count)), [regions]);
  const totalTagged = useMemo(() => regions.reduce((sum, r) => sum + r.count, 0), [regions]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Reports by region</h3>
          <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
            Intensity shows relative volume where members tagged a region ({totalTagged} tagged report
            {totalTagged === 1 ? "" : "s"}). Click a region for its programme page.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)]">
          <span className="h-3 w-8 rounded-sm bg-[hsl(200,18%,88%)] ring-1 ring-black/5" aria-hidden />
          <span>Low</span>
          <span className="h-3 w-8 rounded-sm bg-[var(--primary)] ring-1 ring-black/5" aria-hidden />
          <span>High</span>
        </div>
      </div>

      <div className="relative mx-auto mt-6 max-w-md">
        <svg viewBox={GHANA_REGION_MAP_VIEWBOX} className="h-auto w-full touch-manipulation" aria-label="Ghana regional report heat map">
          <title>Ghana — Voice reports by region</title>
          {Object.entries(GHANA_REGION_MAP_PATHS).map(([name, d]) => {
            const row = countByName.get(name);
            const count = row?.count ?? 0;
            const intensity = normalizeHeatIntensity(count, maxCount);
            const fill = heatFillColor(intensity, count > 0);
            const slug = row?.regionSlug ?? ghanaRegionsData.find((r) => r.name === name)?.slug;
            const isHover = hover?.name === name;

            return (
              <path
                key={name}
                data-region={name}
                d={d}
                fill={fill}
                stroke={isHover ? "rgb(13, 118, 110)" : "rgba(15, 23, 42, 0.32)"}
                strokeWidth={isHover ? 1.6 : 0.85}
                className={slug ? "cursor-pointer transition-[fill,stroke-width] duration-150" : ""}
                onMouseEnter={() => setHover({ name, count, slug: slug ?? "" })}
                onMouseLeave={() => setHover(null)}
                onClick={() => {
                  if (slug) router.push(`/regions/${encodeURIComponent(slug)}`);
                }}
              />
            );
          })}
        </svg>

        {hover ? (
          <div
            className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-slate-900/95 px-3 py-2 text-center text-xs text-white shadow-lg"
            role="tooltip"
          >
            <p className="font-semibold">{hover.name}</p>
            <p className="mt-0.5 tabular-nums text-slate-300">
              {hover.count} report{hover.count === 1 ? "" : "s"}
            </p>
          </div>
        ) : null}
      </div>

      {regions.length > 0 ? (
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {regions.slice(0, 8).map((r) => (
            <li key={r.regionName}>
              <Link
                href={r.regionSlug ? `/regions/${encodeURIComponent(r.regionSlug)}` : "#"}
                className={`flex items-center justify-between gap-2 rounded-lg border border-[var(--border)]/80 px-3 py-2 text-sm transition-colors hover:bg-[var(--section-light)] ${primaryLinkClass}`}
              >
                <span className="font-medium text-[var(--foreground)]">{r.regionName}</span>
                <span className="shrink-0 font-semibold tabular-nums text-[var(--primary)]">{r.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[var(--foreground-secondary)]">
          No region-tagged reports yet — counts will appear as members include location on submissions.
        </p>
      )}
    </div>
  );
}
