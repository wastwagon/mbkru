"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { RegionData } from "@/components/ui/RegionModal";
import { GHANA_REGION_MAP_COLORS } from "@/lib/geo/ghana-region-map-colors";
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

function regionFill(name: string): string {
  return GHANA_REGION_MAP_COLORS[name] ?? "hsl(200, 35%, 75%)";
}

function labelFontSize(name: string): number {
  if (name.length >= 15) return 5.25;
  if (name.length >= 12) return 5.75;
  if (name.length >= 9) return 6.5;
  return 7.25;
}

export function GhanaRegionsSvgMap({ onSelectRegion, selectedRegionName }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hover, setHover] = useState<{ name: string; clientX: number; clientY: number } | null>(null);
  const [labelCenters, setLabelCenters] = useState<Record<string, { cx: number; cy: number }>>({});

  const hoverData = useMemo(() => (hover ? regionByName(hover.name) : null), [hover]);

  const onPathLeave = useCallback(() => setHover(null), []);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const next: Record<string, { cx: number; cy: number }> = {};
    svg.querySelectorAll<SVGPathElement>("path[data-region]").forEach((el) => {
      const name = el.getAttribute("data-region");
      if (!name) return;
      try {
        const { x, y, width, height } = el.getBBox();
        next[name] = { cx: x + width / 2, cy: y + height / 2 };
      } catch {
        /* JSDOM / SSR */
      }
    });
    const id = requestAnimationFrame(() => {
      setLabelCenters(next);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative mt-8 rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
      <div>
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-black">
          Regional map
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-black">
          <span
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[var(--primary)]/10 text-[var(--primary)]"
            aria-hidden
          >
            <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </span>
          Each region is coloured and labelled. Hover for a quick preview; click for full details. Administrative
          boundaries © GADM (simplified for web).
        </p>
      </div>

      <div className="relative mx-auto mt-4 max-w-xl">
        <svg
          ref={svgRef}
          viewBox={GHANA_REGION_MAP_VIEWBOX}
          className="h-auto w-full touch-manipulation"
          aria-label="Map of Ghana"
        >
          <title>Map of Ghana — 16 regions</title>
          {Object.entries(GHANA_REGION_MAP_PATHS).map(([name, d]) => {
            const selected = selectedRegionName === name;
            const isHover = hover?.name === name;
            const base = regionFill(name);
            const fill =
              selected
                ? `color-mix(in srgb, ${base} 72%, rgb(13 148 136) 28%)`
                : isHover
                  ? `color-mix(in srgb, ${base} 88%, rgb(15 23 42) 12%)`
                  : base;
            return (
              <path
                key={name}
                data-region={name}
                d={d}
                fill={fill}
                stroke={selected ? "rgb(13, 148, 136)" : isHover ? "rgb(13, 118, 110)" : "rgba(15, 23, 42, 0.38)"}
                strokeWidth={selected ? 2.25 : isHover ? 1.4 : 0.9}
                className="cursor-pointer transition-[fill,stroke-width] duration-150"
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
          {Object.entries(labelCenters).map(([name, { cx, cy }]) => {
            const fs = labelFontSize(name);
            return (
              <text
                key={`label-${name}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                pointerEvents="none"
                className="select-none font-sans font-semibold"
                style={{
                  fontSize: fs,
                  fill: "rgb(15 23 42)",
                  stroke: "rgba(255,255,255,0.92)",
                  strokeWidth: 0.35,
                  paintOrder: "stroke fill",
                }}
              >
                {name}
              </text>
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
