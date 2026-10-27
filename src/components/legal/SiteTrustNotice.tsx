"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { siteTrustNotice } from "@/config/site-disclaimers";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

function dismissalStorageKey() {
  return `${siteTrustNotice.storageKey}${siteTrustNotice.version}`;
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(dismissalStorageKey()) === "1";
  } catch {
    return false;
  }
}

/** Reserved height avoids layout shift while we read localStorage (mobile flicker fix). */
const PLACEHOLDER_CLASS =
  "relative z-[55] min-h-[4.25rem] border-b border-transparent bg-[var(--section-light)]/95 sm:min-h-[3.5rem]";

/** Dismissible trust notice above the header; footer trust line remains when closed. */
export function SiteTrustNotice() {
  const [state, setState] = useState<"pending" | "open" | "closed">("pending");

  useEffect(() => {
    setState(readDismissed() ? "closed" : "open");
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(dismissalStorageKey(), "1");
    } catch {
      /* private mode */
    }
    setState("closed");
  }, []);

  if (state === "closed") return null;

  const launchPolish = platformFeatures.publicLaunchPolish(getPublicPlatformPhase());
  const bodyText = launchPolish ? siteTrustNotice.compactBody : siteTrustNotice.body;

  if (state === "pending") {
    return <div className={PLACEHOLDER_CLASS} aria-hidden="true" />;
  }

  return (
    <div
      className="relative z-[55] border-b border-[var(--primary)]/20 bg-[var(--section-light)]/95"
      role="region"
      aria-label={siteTrustNotice.ariaLabel}
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2.5 sm:items-center sm:gap-4 sm:px-6 lg:px-8">
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-[var(--foreground-secondary)] sm:text-sm">
          {bodyText}{" "}
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
