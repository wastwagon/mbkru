import Link from "next/link";

import { homepageTrustLine } from "@/config/site-disclaimers";
import { primaryLinkClass } from "@/lib/primary-link-styles";

/** Persistent trust line below the hero — complements the dismissible site banner. */
export function HomeTrustStrip() {
  return (
    <aside className="border-b border-[var(--border)] bg-[var(--section-light)]/90 py-3.5 sm:py-4">
      <div className="mx-auto max-w-4xl px-4 text-center text-xs leading-relaxed text-[var(--foreground-secondary)] sm:px-6 sm:text-sm lg:max-w-5xl lg:px-8">
        <span className="font-semibold text-[var(--foreground)]">{homepageTrustLine.body}</span>{" "}
        {homepageTrustLine.emergencyNote}{" "}
        <Link href="/methodology" className={`font-semibold ${primaryLinkClass}`}>
          {homepageTrustLine.methodologyLabel}
        </Link>
        {" · "}
        <Link href="/terms" className={primaryLinkClass}>
          Terms
        </Link>
      </div>
    </aside>
  );
}
