"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ghanaRegionSlugFromDisplayName } from "@/lib/geo/ghana-region-slug";

import { RegionModalEngagementLinks } from "@/components/ui/RegionModalEngagementLinks";

const PILLAR_LABELS: Record<string, string> = {
  A: "Digital Platform",
  B: "Physical Engagement",
  C: "Legal Empowerment",
  D: "Accountability & Electoral Watch",
  E: "Presidential Interface",
};

export type RegionData = {
  name: string;
  capital: string;
  population: number;
  areaKm2: number;
  districts?: number;
  constituencies?: number;
  regionalMinister?: string;
  keySectors?: string;
  pillarFocus?: readonly string[];
  townHallStatus?: string;
  mbkruVoiceStatus?: string;
  mbkruNote: string;
};

type RegionModalProps = {
  region: RegionData | null;
  onClose: () => void;
};

function formatPopulation(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

export function RegionModal({ region, onClose }: RegionModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (region) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [region, onClose]);

  return (
    <AnimatePresence>
      {region && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="region-modal-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--border)] bg-white p-6 shadow-xl focus-visible:outline-none sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 id="region-modal-title" className="font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl">
                {region.name}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  Regional Capital
                </dt>
                <dd className="mt-1 font-medium text-[var(--foreground)]">{region.capital}</dd>
              </div>
              {region.regionalMinister && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    Regional Minister
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--foreground)]">{region.regionalMinister}</dd>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    Population (2021)
                  </dt>
                  <dd className="mt-1 font-semibold tabular-nums text-[var(--primary)]">
                    {formatPopulation(region.population)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    Area
                  </dt>
                  <dd className="mt-1 font-semibold tabular-nums text-[var(--foreground)]">
                    {region.areaKm2.toLocaleString()} km²
                  </dd>
                </div>
                {region.districts != null && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                      Districts
                    </dt>
                    <dd className="mt-1 font-semibold tabular-nums text-[var(--primary)]">
                      {region.districts}
                    </dd>
                  </div>
                )}
                {region.constituencies != null && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                      Constituencies (MPs)
                    </dt>
                    <dd className="mt-1 font-semibold tabular-nums text-[var(--primary)]">
                      {region.constituencies}
                    </dd>
                  </div>
                )}
              </div>
              {region.keySectors && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    Key Sectors
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--foreground)]">{region.keySectors}</dd>
                </div>
              )}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--section-light)] p-4">
                <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  MBKRU Engagement
                </dt>
                <div className="mt-3 space-y-3">
                  {region.pillarFocus && region.pillarFocus.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">Pillar focus: </span>
                      <span className="text-sm text-[var(--foreground)]">
                        {region.pillarFocus.map((p) => `${p} (${PILLAR_LABELS[p] ?? p})`).join(", ")}
                      </span>
                    </div>
                  )}
                  {region.townHallStatus && (
                    <div>
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">Town Hall: </span>
                      <span className="text-sm font-medium text-[var(--primary)]">{region.townHallStatus}</span>
                    </div>
                  )}
                  {region.mbkruVoiceStatus && (
                    <div>
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">MBKRU Voice: </span>
                      <span className="text-sm font-medium text-[var(--foreground)]">{region.mbkruVoiceStatus}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-[var(--foreground)]">{region.mbkruNote}</p>
                </div>
              </div>
            </dl>

            <RegionModalEngagementLinks regionSlug={ghanaRegionSlugFromDisplayName(region.name)} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
