"use client";

import { useState } from "react";
import { ghanaRegionsData } from "@/lib/placeholders";
import { RegionModal, type RegionData } from "@/components/ui/RegionModal";

/**
 * 16 Regions of Ghana — interactive data viz with modal lightbox
 * Click a region to view capital, population, area, and MBKRU engagement
 */
export function RegionsViz() {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);

  return (
    <>
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            16 Regions of Ghana
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-[var(--primary)]/10 text-[var(--primary)]" aria-hidden>
              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Click any region for details
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ghanaRegionsData.map((region) => (
            <button
              key={region.name}
              type="button"
              onClick={() => setSelectedRegion(region)}
              className="group relative flex cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--section-light)] to-white px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/30 hover:shadow-md hover:shadow-[var(--primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20 sm:text-base"
            >
              <span className="relative z-10">{region.name}</span>
              <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] transition-all duration-200 group-hover:bg-[var(--primary)] group-hover:text-white">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>
      <RegionModal region={selectedRegion} onClose={() => setSelectedRegion(null)} />
    </>
  );
}
