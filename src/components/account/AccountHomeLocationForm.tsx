"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { updateMemberHomeLocationAction } from "@/app/(main)/account/actions";
import { focusRingSmClass } from "@/lib/primary-link-styles";

type RegionRow = { id: string; name: string; slug: string };
type ConstituencyRow = { id: string; name: string; slug: string };

const selectClass = `mt-1 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

export function AccountHomeLocationForm({
  initialRegionId,
  initialConstituencyId,
}: {
  initialRegionId: string | null;
  initialConstituencyId: string | null;
}) {
  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [regionId, setRegionId] = useState(initialRegionId ?? "");
  const [constituencyId, setConstituencyId] = useState(initialConstituencyId ?? "");
  const [constituencies, setConstituencies] = useState<ConstituencyRow[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingConst, setLoadingConst] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedRegionSlug = useMemo(() => regions.find((r) => r.id === regionId)?.slug ?? "", [regions, regionId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/regions");
        const j = (await res.json()) as { regions?: RegionRow[] };
        if (!cancelled && res.ok && Array.isArray(j.regions)) setRegions(j.regions);
      } finally {
        if (!cancelled) setLoadingRegions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedRegionSlug) {
      setConstituencies([]);
      return;
    }
    let cancelled = false;
    setLoadingConst(true);
    (async () => {
      try {
        const res = await fetch(`/api/regions/${encodeURIComponent(selectedRegionSlug)}/constituencies`);
        const j = (await res.json()) as { constituencies?: ConstituencyRow[] };
        if (!cancelled && res.ok && Array.isArray(j.constituencies)) {
          setConstituencies(j.constituencies);
        }
      } finally {
        if (!cancelled) setLoadingConst(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedRegionSlug]);

  useEffect(() => {
    if (!initialConstituencyId || constituencies.length === 0) return;
    const still = constituencies.some((c) => c.id === initialConstituencyId);
    if (still && regionId === initialRegionId) {
      setConstituencyId(initialConstituencyId);
    }
  }, [constituencies, initialConstituencyId, initialRegionId, regionId]);

  return (
    <section className="mt-8" aria-labelledby="home-location-heading">
      <h2 id="home-location-heading" className="font-display text-lg font-semibold text-[var(--foreground)]">
        Home region &amp; constituency
      </h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Used for regional chat presence and local filters. You can update these if you move.
      </p>
      <form
        className="mt-4 max-w-lg space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setMessage(null);
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const out = await updateMemberHomeLocationAction(fd);
            if (out.ok) {
              setMessage({ kind: "ok", text: "Home location saved." });
            } else {
              setMessage({ kind: "err", text: out.error });
            }
          });
        }}
      >
        <div>
          <label htmlFor="acct-region" className="block text-sm font-medium text-[var(--foreground)]">
            Region
          </label>
          <select
            id="acct-region"
            name="regionId"
            required
            value={regionId}
            onChange={(e) => {
              setRegionId(e.target.value);
              setConstituencyId("");
            }}
            className={selectClass}
            disabled={loadingRegions || regions.length === 0}
          >
            <option value="">{loadingRegions ? "Loading…" : "Select region"}</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="acct-const" className="block text-sm font-medium text-[var(--foreground)]">
            Constituency <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
          </label>
          <select
            id="acct-const"
            name="constituencyId"
            value={constituencyId}
            onChange={(e) => setConstituencyId(e.target.value)}
            className={selectClass}
            disabled={!regionId || loadingConst || constituencies.length === 0}
          >
            <option value="">
              {!regionId ? "Select a region first" : loadingConst ? "Loading…" : "Optional constituency"}
            </option>
            {constituencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {message ? (
          <p
            className={`text-sm ${message.kind === "ok" ? "text-emerald-700" : "text-red-600"}`}
            role={message.kind === "err" ? "alert" : undefined}
          >
            {message.text}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending || !regionId}
          className={`min-h-11 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-50 ${focusRingSmClass}`}
        >
          {pending ? "Saving…" : "Save location"}
        </button>
      </form>
    </section>
  );
}
