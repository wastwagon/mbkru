"use client";

import { useCallback, useMemo, useState } from "react";

import type { RegionData } from "@/components/ui/RegionModal";
import { GHANA_REGION_MAP_PATHS, GHANA_REGION_MAP_VIEWBOX } from "@/lib/geo/ghana-region-map-paths.generated";
import { ghanaRegionsData } from "@/lib/site-content";

type Props = {
  onSelectRegion: (region: RegionData) => void;
  /** Outline the region that matches the open modal (if any). */
  selectedRegionName?: string | null;
};

function regionByName(name: string): RegionData | undefined {
  return ghanaRegionsData.find((r) => r.name === name) as RegionData | undefined;
}

export function GhanaRegionsSvgMap({ onSelectRegion, selectedRegionName }: Props) {
  const [hover, setHover] = useState<{ name: string; clientX: number; clientY: number } | null>(null);

  const hoverData = useMemo(() => (hover ? regionByName(hover.name) : null), [hover]);

  const onPathLeave = useCallback(() => setHover(null), []);

  return (
    <div className="relative mt-8 rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--section-light)]/60 to-white p-4 shadow-[var(--shadow-card)] sm:p-6">
      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Regional map
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted-foreground)]">
          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--primary)]/10 text-[var(--primary)]" aria-hidden>
            <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </span>
          Hover for a quick preview; click for the same full details as the grid above. Administrative boundaries © GADM
          (simplified for web).
        </p>
      </div>

      <div className="relative mx-auto mt-4 max-w-xl">
        <svg viewBox={GHANA_REGION_MAP_VIEWBOX} className="h-auto w-full touch-manipulation" aria-label="Map of Ghana">
          <title>Map of Ghana — 16 regions</title>
          {Object.entries(GHANA_REGION_MAP_PATHS).map(([name, d]) => {
            const selected = selectedRegionName === name;
            return (
              <path
                key={name}
                d={d}
                fill={selected ? "rgba(15, 118, 110, 0.35)" : "rgba(15, 118, 110, 0.14)"}
                stroke={selected ? "rgb(13, 148, 136)" : "rgba(15, 23, 42, 0.45)"}
                strokeWidth={selected ? 2 : 0.85}
                className="cursor-pointer transition-[fill,stroke-width] duration-150 hover:fill-[rgba(15,118,110,0.28)] hover:stroke-[rgb(13,148,136)]"
                onMouseEnter={(e) => {
                  setHover({ name, clientX: e.clientX, clientY: e.clientY });
                }}
                onMouseMove={(e) => {
                  setHover({ name, clientX: e.clientX, clientY: e.clientY });
                }}
                onMouseLeave={onPathLeave}
                onClick={() => {
                  const r = regionByName(name);
                  if (r) onSelectRegion(r);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const r = regionByName(name);
                    if (r) onSelectRegion(r);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${name} region — open details`}
              />
            );
          })}
        </svg>
      </div>

      {hover && hoverData ? (
        <div
          className="pointer-events-none fixed z-[60] max-w-xs rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-black/5"
          style={{
            left: Math.max(
              8,
              Math.min(hover.clientX + 14, (typeof window !== "undefined" ? window.innerWidth : 999) - 220),
            ),
            top: hover.clientY + 14,
          }}
        >
          <p className="font-semibold text-[var(--foreground)]">{hoverData.name}</p>
          <p className="mt-0.5 text-[var(--muted-foreground)]">Capital: {hoverData.capital}</p>
          <p className="mt-1 max-h-10 overflow-hidden text-ellipsis text-[var(--muted-foreground)]">{hoverData.mbkruNote}</p>
          <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--primary)]">Click for full details</p>
        </div>
      ) : null}
    </div>
  );
}
