import Link from "next/link";

import { siteTrustNotice } from "@/config/site-disclaimers";
import { primaryLinkClass } from "@/lib/primary-link-styles";

/** Persistent trust line above the header — complements the dismissible {@link SiteDisclaimerBanner}. */
export function SiteTrustNotice() {
  return (
    <div
      className="relative z-[54] border-b border-[var(--primary)]/15 bg-[var(--section-light)]/95"
      role="region"
      aria-label={siteTrustNotice.ariaLabel}
    >
      <div className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] leading-snug text-[var(--foreground-secondary)] sm:px-6 sm:text-xs lg:px-8">
        <span className="font-semibold text-[var(--foreground)]">{siteTrustNotice.body}</span>{" "}
        <Link href="/methodology" className={`font-semibold ${primaryLinkClass}`}>
          {siteTrustNotice.methodologyLabel}
        </Link>
        {" · "}
        <Link href="/terms" className={primaryLinkClass}>
          {siteTrustNotice.termsLabel}
        </Link>
      </div>
    </div>
  );
}
