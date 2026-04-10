"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Region = { id: string; name: string };

export function PetitionCreateForm({ regions }: { regions: Region[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [targetSignatures, setTargetSignatures] = useState("");
  const [regionId, setRegionId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const ts = targetSignatures.trim();
      const res = await fetch("/api/petitions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim() || null,
          body: body.trim(),
          targetSignatures: ts ? Number.parseInt(ts, 10) : null,
          regionId: regionId || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; slug?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create petition.");
        return;
      }
      if (data.slug) router.push(`/petitions/${encodeURIComponent(data.slug)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>
      ) : null}
      <div>
        <label htmlFor="pt-title" className="block text-sm font-medium text-[var(--foreground)]">
          Title
        </label>
        <input
          id="pt-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={280}
          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          placeholder="Short headline for your petition"
        />
      </div>
      <div>
        <label htmlFor="pt-summary" className="block text-sm font-medium text-[var(--foreground)]">
          Summary (optional)
        </label>
        <input
          id="pt-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={500}
          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          placeholder="One line for listings"
        />
      </div>
      <div>
        <label htmlFor="pt-body" className="block text-sm font-medium text-[var(--foreground)]">
          Full text
        </label>
        <textarea
          id="pt-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={10}
          maxLength={50_000}
          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          placeholder="Context, asks, and what success looks like. Be factual and respectful."
        />
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          MBKRU is independent; petitions express citizen concern, not a government or court filing.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pt-goal" className="block text-sm font-medium text-[var(--foreground)]">
            Signature goal (optional)
          </label>
          <input
            id="pt-goal"
            type="number"
            min={10}
            max={10_000_000}
            value={targetSignatures}
            onChange={(e) => setTargetSignatures(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            placeholder="e.g. 500"
          />
        </div>
        <div>
          <label htmlFor="pt-region" className="block text-sm font-medium text-[var(--foreground)]">
            Region (optional)
          </label>
          <select
            id="pt-region"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          >
            <option value="">All / national</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60"
      >
        {busy ? "Publishing…" : "Publish petition"}
      </button>
    </form>
  );
}
