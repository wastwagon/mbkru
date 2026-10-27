"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  DEFAULT_CONSTRUCTION_BODY,
  DEFAULT_CONSTRUCTION_HEADLINE,
} from "@/lib/construction-gate-copy";
import type { PublicSiteConfig } from "@/lib/site-config-types";

type ApiResponse = {
  ok?: boolean;
  error?: string;
  config?: PublicSiteConfig;
  envConstructionOverride?: boolean;
  effectivePublicUnderConstruction?: boolean;
};

export function SiteVisibilityPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<PublicSiteConfig | null>(null);
  const [envConstructionOverride, setEnvConstructionOverride] = useState(false);
  const [effectivePublicUnderConstruction, setEffectivePublicUnderConstruction] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-config", { credentials: "include" });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setConfig(data.config ?? null);
      setEnvConstructionOverride(Boolean(data.envConstructionOverride));
      setEffectivePublicUnderConstruction(Boolean(data.effectivePublicUnderConstruction));
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
      if (data.config) setConfig(data.config);
      setEnvConstructionOverride(Boolean(data.envConstructionOverride));
      setEffectivePublicUnderConstruction(Boolean(data.effectivePublicUnderConstruction));
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
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
      className="mt-8 scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8"
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

      {envConstructionOverride ? (
        <div
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-sm leading-relaxed text-amber-950"
          role="status"
        >
          <p className="font-semibold">Deploy environment is forcing the gate on</p>
          <p className="mt-1">
            <code className="rounded bg-amber-100/80 px-1">PUBLIC_UNDER_CONSTRUCTION</code> is set on the server, so
            visitors stay on the holding page even if you uncheck the box below and save. Uncheck here to prepare the
            database, then remove that variable from production hosting (or run{" "}
            <code className="rounded bg-amber-100/80 px-1">npm run ops:construction:off</code> on the server) and
            redeploy or restart the app.
          </p>
        </div>
      ) : null}

      {!envConstructionOverride && effectivePublicUnderConstruction ? (
        <p className="mt-4 text-sm font-medium text-amber-900" role="status">
          Visitors currently see the under-construction page (saved setting is on).
        </p>
      ) : null}

      {!envConstructionOverride && !effectivePublicUnderConstruction ? (
        <p className="mt-4 text-sm font-medium text-emerald-800" role="status">
          Visitors can browse the public site (gate is off).
        </p>
      ) : null}

      {envConstructionOverride ? (
        <p className="mt-4 text-sm font-medium text-amber-900" role="status">
          Live status for visitors: under construction (environment override).
        </p>
      ) : null}

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
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSaved(false);
              setConfig({
                ...config,
                constructionHeadline: DEFAULT_CONSTRUCTION_HEADLINE,
                constructionBody: DEFAULT_CONSTRUCTION_BODY,
              });
            }}
          >
            Use recommended copy
          </Button>
          <span className="text-xs text-[var(--foreground-secondary)]">
            Fills headline and message with launch-ready defaults (same as ops:construction:on).
          </span>
        </div>
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
            placeholder={DEFAULT_CONSTRUCTION_HEADLINE}
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
            placeholder={DEFAULT_CONSTRUCTION_BODY}
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
