"use client";

import { useEffect, useState } from "react";

import { primaryLinkClass } from "@/lib/primary-link-styles";

const STORAGE_KEY = "mbkru_home_region_nudge_dismissed";

/** Prompt legacy accounts (no home region) to complete location — powers regional presence & filters. */
export function AccountHomeRegionBanner({ show }: { show: boolean }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!show || dismissed) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <div
      className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:p-5"
      role="status"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-amber-950">Set your home region</p>
          <p className="mt-1 text-sm text-amber-900/90">
            Add your region (and optional constituency) so you appear in{" "}
            <strong>regional &quot;who&apos;s online&quot;</strong>, map links, and Report Card filters match where you
            live.
          </p>
          <p className="mt-2 text-sm">
            <a href="#home-location-heading" className={`font-semibold ${primaryLinkClass}`}>
              Jump to home region below →
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-amber-900 underline-offset-2 hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
