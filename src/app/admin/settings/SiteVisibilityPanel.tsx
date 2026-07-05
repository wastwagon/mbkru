"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import type { PublicSiteConfig } from "@/lib/site-config-types";

type ApiResponse = {
  ok?: boolean;
  error?: string;
  config?: PublicSiteConfig;
};

export function SiteVisibilityPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<PublicSiteConfig | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-config", { credentials: "include" });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setConfig(data.config ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load site visibility settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicUnderConstruction: config.publicUnderConstruction,
          constructionHeadline: config.constructionHeadline,
          constructionBody: config.constructionBody,
        }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setConfig(data.config ?? config);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <p className="text-sm text-[var(--foreground-secondary)]">Loading site visibility…</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50/50 p-6">
        <p className="text-sm text-rose-800">{error ?? "Site visibility settings unavailable."}</p>
      </div>
    );
  }

  return (
    <div
      id="site-visibility"
      className="mt-8 scroll-mt-24 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="font-display text-lg font-bold text-[var(--foreground)]">Public site visibility</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-secondary)]">
        When enabled, visitors see an under-construction page. <strong className="text-[var(--foreground)]">Only signed-in admins</strong>{" "}
        can browse the full public site (preview mode). Members and guests stay gated. Track blockers in{" "}
        <a href="#launch-readiness" className="font-medium text-[var(--primary)] underline">
          Launch readiness
        </a>{" "}
        above.
      </p>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--section-light)]/40 p-4">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
          checked={config.publicUnderConstruction}
          onChange={(e) => {
            setSaved(false);
            setConfig({ ...config, publicUnderConstruction: e.target.checked });
          }}
        />
        <span>
          <span className="block text-sm font-semibold text-[var(--foreground)]">Public site under construction</span>
          <span className="mt-1 block text-xs leading-relaxed text-[var(--foreground-secondary)]">
            Redirects all public pages and APIs (except health checks and admin) to the holding page.
          </span>
        </span>
      </label>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="construction-headline" className="mb-1.5 block text-xs font-semibold text-[var(--foreground-secondary)]">
            Headline (optional)
          </label>
          <input
            id="construction-headline"
            type="text"
            maxLength={200}
            value={config.constructionHeadline ?? ""}
            onChange={(e) => {
              setSaved(false);
              setConfig({ ...config, constructionHeadline: e.target.value || null });
            }}
            placeholder="We're preparing something important"
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="construction-body" className="mb-1.5 block text-xs font-semibold text-[var(--foreground-secondary)]">
            Message (optional)
          </label>
          <textarea
            id="construction-body"
            rows={4}
            maxLength={4000}
            value={config.constructionBody ?? ""}
            onChange={(e) => {
              setSaved(false);
              setConfig({ ...config, constructionBody: e.target.value || null });
            }}
            placeholder="Short note for visitors…"
            className="w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save visibility"}
        </Button>
        <a
          href="/under-construction"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[var(--primary)] underline"
        >
          Preview holding page
        </a>
        <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--primary)] underline">
          Open homepage (admin preview)
        </a>
      </div>

      {saved ? (
        <p className="mt-4 text-sm font-medium text-emerald-700" role="status">
          Saved. Changes may take a few seconds to apply across all server instances.
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      {config.updatedAt ? (
        <p className="mt-4 text-xs text-[var(--foreground-secondary)]">
          Last updated {new Date(config.updatedAt).toLocaleString("en-GB")}
        </p>
      ) : null}
    </div>
  );
}
