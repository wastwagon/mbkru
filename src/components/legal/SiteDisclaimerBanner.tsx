"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { siteDisclaimerBanner } from "@/config/site-disclaimers";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

function dismissalStorageKey() {
  return `${siteDisclaimerBanner.storageKey}${siteDisclaimerBanner.version}`;
}

/** Non-blocking strip above the header; dismiss once per browser (site stays fully usable). */
export function SiteDisclaimerBanner() {
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
      className="relative z-[55] border-b border-[var(--primary)]/20 bg-[var(--section-light)]"
      role="region"
      aria-label={siteDisclaimerBanner.ariaLabel}
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-2.5 sm:items-center sm:gap-4 sm:px-6 lg:px-8">
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-sm">
          {siteDisclaimerBanner.body}{" "}
          <Link href="/methodology" className={`font-medium ${primaryLinkClass}`}>
            {siteDisclaimerBanner.methodologyLabel}
          </Link>
          {" · "}
          <Link href="/terms" className={`font-medium ${primaryLinkClass}`}>
            {siteDisclaimerBanner.termsLabel}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--primary)]/10 ${focusRingSmClass}`}
          aria-label="Dismiss site notice"
        >
          Close
        </button>
      </div>
    </div>
  );
}
