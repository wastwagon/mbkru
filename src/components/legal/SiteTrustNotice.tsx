"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { siteTrustNotice } from "@/config/site-disclaimers";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

function dismissalStorageKey() {
  return `${siteTrustNotice.storageKey}${siteTrustNotice.version}`;
}

/** Dismissible trust notice above the header; footer trust line remains when closed. */
export function SiteTrustNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(dismissalStorageKey()) === "1") return;
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(dismissalStorageKey(), "1");
    } catch {
      /* private mode */
    }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="relative z-[55] border-b border-[var(--primary)]/20 bg-[var(--section-light)]/95"
      role="region"
      aria-label={siteTrustNotice.ariaLabel}
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2.5 sm:items-center sm:gap-4 sm:px-6 lg:px-8">
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-[var(--foreground-secondary)] sm:text-sm">
          {siteTrustNotice.body}{" "}
          <Link href="/report-card" className={`font-medium ${primaryLinkClass}`}>
            {siteTrustNotice.reportCardLabel}
          </Link>
          {" · "}
          <Link href="/methodology" className={`font-medium ${primaryLinkClass}`}>
            {siteTrustNotice.methodologyLabel}
          </Link>
          {" · "}
          <Link href="/terms" className={`font-medium ${primaryLinkClass}`}>
            {siteTrustNotice.termsLabel}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className={`inline-flex min-h-11 shrink-0 touch-manipulation items-center rounded-md px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--primary)]/10 ${focusRingSmClass}`}
          aria-label="Dismiss site notice"
        >
          Close
        </button>
      </div>
    </div>
  );
}
