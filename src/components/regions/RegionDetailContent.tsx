import type { RegionData } from "@/components/regions/region-types";

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
export function RegionDetailContent({ region }: { region: RegionData }) {
  return (
    <dl className="space-y-4">
      <div>
        <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Regional Capital</dt>
        <dd className="mt-1 font-medium text-[var(--foreground)]">{region.capital}</dd>
      </div>
      {region.regionalMinister && (
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Regional Minister</dt>
          <dd className="mt-1 font-medium text-[var(--foreground)]">{region.regionalMinister}</dd>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Population (2021)</dt>
          <dd className="mt-1 font-semibold tabular-nums text-[var(--primary)]">{formatPopulation(region.population)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Area</dt>
          <dd className="mt-1 font-semibold tabular-nums text-[var(--foreground)]">{region.areaKm2.toLocaleString()} km²</dd>
        </div>
        {region.districts != null && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Districts</dt>
            <dd className="mt-1 font-semibold tabular-nums text-[var(--primary)]">{region.districts}</dd>
          </div>
        )}
        {region.constituencies != null && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Constituencies (MPs)</dt>
            <dd className="mt-1 font-semibold tabular-nums text-[var(--primary)]">{region.constituencies}</dd>
          </div>
        )}
      </div>
      {region.keySectors && (
        <div>
          <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Key Sectors</dt>
          <dd className="mt-1 text-sm text-[var(--foreground)]">{region.keySectors}</dd>
        </div>
      )}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--section-light)] p-4">
        <dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">MBKRU Engagement</dt>
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
  );
}
