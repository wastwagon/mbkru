import type { RegionData } from "@/components/regions/region-types";
import { RegionSectorGallery } from "@/components/regions/RegionSectorGallery";
import type { RegionGalleryImage } from "@/lib/regions/sector-images";

const PILLAR_LABELS: Record<string, string> = {
  A: "Digital Platform",
  B: "Physical Engagement",
  C: "Legal Empowerment",
  D: "Accountability & Electoral Watch",
  E: "Presidential Interface",
};

function formatPopulation(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

/** Facts + MBKRU engagement block — shared by regional hub pages (no modal chrome). */
export function RegionDetailContent({
  region,
  sectorGallery = [],
}: {
  region: RegionData;
  sectorGallery?: RegionGalleryImage[];
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Regional facts</h2>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="text-xs font-semibold text-[var(--foreground-secondary)]">Regional capital</dt>
            <dd className="mt-1 font-medium text-[var(--foreground)]">{region.capital}</dd>
          </div>
          {region.regionalMinister ? (
            <div>
              <dt className="text-xs font-semibold text-[var(--foreground-secondary)]">Regional minister</dt>
              <dd className="mt-1 font-medium text-[var(--foreground)]">{region.regionalMinister}</dd>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold text-[var(--foreground-secondary)]">Population (2021)</dt>
              <dd className="mt-1 font-semibold tabular-nums text-[var(--primary)]">{formatPopulation(region.population)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[var(--foreground-secondary)]">Area</dt>
              <dd className="mt-1 font-semibold tabular-nums text-[var(--foreground)]">
                {region.areaKm2.toLocaleString()} km²
              </dd>
            </div>
            {region.districts != null ? (
              <div>
                <dt className="text-xs font-semibold text-[var(--foreground-secondary)]">Districts</dt>
                <dd className="mt-1 font-semibold tabular-nums text-[var(--primary)]">{region.districts}</dd>
              </div>
            ) : null}
            {region.constituencies != null ? (
              <div>
                <dt className="text-xs font-semibold text-[var(--foreground-secondary)]">Constituencies (MPs)</dt>
                <dd className="mt-1 font-semibold tabular-nums text-[var(--primary)]">{region.constituencies}</dd>
              </div>
            ) : null}
          </div>
          {region.keySectors ? (
            <div>
              <dt className="text-xs font-semibold text-[var(--foreground-secondary)]">Key sectors</dt>
              <dd className="mt-1 text-sm leading-relaxed text-[var(--foreground)]">{region.keySectors}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <RegionSectorGallery regionName={region.name} images={sectorGallery} />

      <div className="rounded-2xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/8 to-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">MBKRU engagement in {region.name}</h2>
        <div className="mt-4 space-y-4">
          {region.pillarFocus && region.pillarFocus.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-[var(--foreground-secondary)]">Operational pillar focus</p>
              <ul className="mt-2 flex flex-wrap gap-2" aria-label="MBKRU pillar focus">
                {region.pillarFocus.map((p) => (
                  <li key={p}>
                    <span className="inline-flex rounded-full border border-[var(--primary)]/25 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[var(--primary-dark)]">
                      {p} · {PILLAR_LABELS[p] ?? p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {region.townHallStatus ? (
            <div>
              <p className="text-xs font-semibold text-[var(--foreground-secondary)]">Town hall</p>
              <p className="mt-1 text-sm font-medium text-[var(--primary)]">{region.townHallStatus}</p>
            </div>
          ) : null}
          {region.mbkruVoiceStatus ? (
            <div>
              <p className="text-xs font-semibold text-[var(--foreground-secondary)]">MBKRU Voice</p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{region.mbkruVoiceStatus}</p>
            </div>
          ) : null}
          <p className="text-sm leading-relaxed text-[var(--foreground-secondary)]">{region.mbkruNote}</p>
        </div>
      </div>
    </div>
  );
}
