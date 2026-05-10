"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { reportKindLabel } from "@/lib/report-status-text";
import type { CitizenReportKind } from "@prisma/client";

import { VOICE_SUBMISSION_KIND_FILTERS } from "@/lib/reports/voice-submission-kind-filters";

export type ReportCardVoiceFiltersPreserve = {
  hasCycles: boolean;
  selectedYear: number;
  selectedRegionId: string;
  qRaw: string;
  safePage: number;
};

export type ReportCardVoiceFiltersValues = {
  vregion: string;
  vkind: string;
  vq: string;
};

type RegionOption = { id: string; name: string };

function buildReportCardVoiceQuery(preserve: ReportCardVoiceFiltersPreserve, voice: ReportCardVoiceFiltersValues & { vpage?: number }): string {
  const p = new URLSearchParams();
  if (preserve.hasCycles) p.set("year", String(preserve.selectedYear));
  if (preserve.selectedRegionId.trim()) p.set("region", preserve.selectedRegionId.trim());
  if (preserve.qRaw.trim()) p.set("q", preserve.qRaw.trim());
  if (preserve.safePage > 1) p.set("page", String(preserve.safePage));

  const vpage = voice.vpage ?? 1;
  if (vpage > 1) p.set("vpage", String(vpage));
  if (voice.vregion.trim()) p.set("vregion", voice.vregion.trim());
  if (voice.vkind.trim()) p.set("vkind", voice.vkind.trim());
  if (voice.vq.trim()) p.set("vq", voice.vq.trim());

  return p.toString();
}

type Props = {
  regions: RegionOption[];
  preserve: ReportCardVoiceFiltersPreserve;
  voice: ReportCardVoiceFiltersValues;
  resetHref: string;
  /** Defaults to `/report-card` — set to `/regions/{slug}` on regional hub pages. */
  browseBasePath?: string;
  /** When set, Voice region is fixed (hidden field) for this browse context. */
  lockedVoiceRegion?: { id: string; name: string };
};

export function ReportCardVoiceFiltersForm({
  regions,
  preserve,
  voice,
  resetHref,
  browseBasePath = "/report-card",
  lockedVoiceRegion,
}: Props) {
  const router = useRouter();

  function applyFilters(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextVoice: ReportCardVoiceFiltersValues = {
      vregion: lockedVoiceRegion?.id ?? String(fd.get("vregion") ?? ""),
      vkind: String(fd.get("vkind") ?? ""),
      vq: String(fd.get("vq") ?? ""),
    };
    const qs = buildReportCardVoiceQuery(preserve, { ...nextVoice, vpage: 1 });
    const base = browseBasePath.replace(/\/$/, "") || "/report-card";
    router.push(qs ? `${base}?${qs}#browse-voice` : `${base}#browse-voice`);
    router.refresh();
  }

  const formKey = `${voice.vregion}|${voice.vkind}|${voice.vq}`;

  return (
    <form key={formKey} className="mt-4 grid gap-4 lg:grid-cols-12 lg:items-end" onSubmit={applyFilters}>
      {lockedVoiceRegion ? (
        <div className="lg:col-span-3">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Region</span>
          <p className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-3 py-2.5 text-sm text-[var(--foreground)]">
            <span className="font-semibold">{lockedVoiceRegion.name}</span>
            <span className="text-[var(--muted-foreground)]"> · this page</span>
          </p>
          <input type="hidden" name="vregion" value={lockedVoiceRegion.id} />
        </div>
      ) : (
        <label className="lg:col-span-3">
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Region</span>
          <select
            name="vregion"
            defaultValue={voice.vregion}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)]"
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="lg:col-span-3">
        <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Report type</span>
        <select
          name="vkind"
          defaultValue={voice.vkind}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)]"
        >
          <option value="">All types</option>
          {VOICE_SUBMISSION_KIND_FILTERS.map((k: CitizenReportKind) => (
            <option key={k} value={k}>
              {reportKindLabel(k)}
            </option>
          ))}
        </select>
      </label>
      <label className="lg:col-span-4">
        <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Search title</span>
        <input
          type="search"
          name="vq"
          defaultValue={voice.vq}
          placeholder="Words from the submission title"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70"
          autoComplete="off"
        />
      </label>
      <div className="flex flex-wrap gap-2 lg:col-span-2">
        <button
          type="submit"
          className="min-h-[44px] flex-1 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-dark)]"
        >
          Apply
        </button>
        <Link
          href={resetHref}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--section-light)]"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
