import Link from "next/link";

import { FooterDeveloperCredit } from "@/components/layout/FooterDeveloperCredit";
import { Logo } from "@/components/ui/Logo";
import { getFooterLegalLinks } from "@/config/public-platform-nav";
import { footerTrustLine } from "@/config/site-disclaimers";
import { focusRingOnDark50Class } from "@/lib/primary-link-styles";

type Props = {
  currentYear: number;
  trustText: string;
};

/** Minimal footer above the bottom tab bar — primary nav lives in MobileBottomNav. */
export function FooterMobileCompact({ currentYear, trustText }: Props) {
  const legalLinks = getFooterLegalLinks();

  return (
    <div className="border-t border-white/20 px-4 py-5 sm:px-6">
      <Logo href="/" theme="dark" className="w-fit scale-[0.85] origin-left opacity-90" />
      <p className="mt-3 text-xs leading-relaxed text-white/70">{trustText}</p>
      <nav
        className="mt-4 flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]"
        aria-label="Footer"
      >
        <Link
          href="/citizens-voice/submit"
          className={`shrink-0 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white ${focusRingOnDark50Class}`}
        >
          Submit report
        </Link>
        <Link
          href="/track-report"
          className={`shrink-0 rounded-full border border-white/25 px-3.5 py-2 text-xs font-semibold text-white/90 ${focusRingOnDark50Class}`}
        >
          Track
        </Link>
        <Link
          href="/methodology"
          className={`shrink-0 rounded-full border border-white/25 px-3.5 py-2 text-xs font-semibold text-white/90 ${focusRingOnDark50Class}`}
        >
          {footerTrustLine.methodologyLabel}
        </Link>
        <Link
          href="/contact"
          className={`shrink-0 rounded-full border border-white/25 px-3.5 py-2 text-xs font-semibold text-white/90 ${focusRingOnDark50Class}`}
        >
          Contact
        </Link>
      </nav>
      <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal">
        {legalLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-xs text-white/60 underline-offset-2 hover:text-white hover:underline ${focusRingOnDark50Class}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="mt-4 text-[11px] text-white/50">
        © {currentYear} MBKRU. All rights reserved.
      </p>
      <FooterDeveloperCredit />
    </div>
  );
}
