"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { RegionData } from "@/components/regions/region-types";
import { GhanaRegionsSvgMap } from "@/components/ui/GhanaRegionsSvgMap";
import { focusRingSmClass } from "@/lib/primary-link-styles";
import { ghanaRegionSlugFromDisplayName } from "@/lib/geo/ghana-region-slug";
import { ghanaRegionsData } from "@/lib/site-content";

/**
 * 16 Regions of Ghana — interactive map and grid; each region opens `/regions/{slug}`.
 */
export function RegionsViz() {
  const router = useRouter();

  function openRegion(r: RegionData) {
    router.push(`/regions/${ghanaRegionSlugFromDisplayName(r.name)}`);
  }

  return (
    <>
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            16 Regions of Ghana
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded bg-[var(--primary)]/10 text-[var(--primary)]"
              aria-hidden
            >
              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Click a region or the map to open its regional hub page
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ghanaRegionsData.map((region) => (
            <Link
              key={region.name}
              href={`/regions/${ghanaRegionSlugFromDisplayName(region.name)}`}
              className={`group relative flex cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--section-light)] to-white px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/30 hover:shadow-md hover:shadow-[var(--primary)]/10 sm:text-base ${focusRingSmClass}`}
            >
              <span className="relative z-10">{region.name}</span>
              <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] transition-all duration-200 group-hover:bg-[var(--primary)] group-hover:text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <GhanaRegionsSvgMap selectedRegionName={null} onSelectRegion={openRegion} />
    </>
  );
}
