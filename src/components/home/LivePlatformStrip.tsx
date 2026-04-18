"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { getAboutPhaseQuickLinks } from "@/config/public-platform-nav";
import { useMemberMe } from "@/hooks/useMemberMe";

const pill =
  "inline-flex shrink-0 snap-start items-center whitespace-nowrap rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)]/45 hover:text-[var(--primary)] active:scale-[0.98]";

export function LivePlatformStrip() {
  const pathname = usePathname();
  const phase = getPublicPlatformPhase();
  const auth = platformFeatures.authentication(phase);
  const { member, busy: authBusy } = useMemberMe(phase >= 2 && auth, pathname);
  const toolLinks = getAboutPhaseQuickLinks(phase);

  if (phase < 2) {
    return (
      <section className="border-y border-[var(--border)] bg-[var(--section-light)]/90 py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm leading-relaxed text-[var(--muted-foreground)] sm:px-6 lg:px-8">
          <span className="font-semibold text-[var(--foreground)]">Phase 1 deployment.</span> News, contact, and waitlists
          are live. {accountabilityProse.livePlatformStripPhase1}
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/[0.07] via-white to-[var(--accent-gold)]/[0.08] py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p
          id="live-deployment-tools-heading"
          className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]"
        >
          Live on this deployment
        </p>
        <p className="mx-auto mt-1 max-w-2xl text-center text-xs text-[var(--muted-foreground)]">
          Phase {phase} — the shortcuts below match what is turned on for visitors on this site, including accountability
          browsing when your programme enables it.
        </p>
        <p className="mb-2 mt-4 text-center text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)] sm:hidden">
          Swipe for more tools →
        </p>
        <div className="relative max-sm:[-webkit-mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-12px),transparent)] max-sm:[mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-12px),transparent)]">
          <div
            role="region"
            aria-labelledby="live-deployment-tools-heading"
            tabIndex={0}
            className="-mx-4 flex flex-nowrap snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain scroll-smooth scroll-pl-4 scroll-pr-4 px-4 pb-1.5 pt-0.5 outline-none motion-reduce:snap-none motion-reduce:scroll-auto focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] [scrollbar-gutter:stable] [scrollbar-width:thin] sm:-mx-6 sm:gap-2.5 sm:px-6 sm:scroll-pl-6 sm:scroll-pr-6 lg:-mx-8 lg:px-8 lg:scroll-pl-8 lg:scroll-pr-8 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--primary)]/35"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {toolLinks.map((link, i) => (
              <Fragment key={link.href}>
                {i === 2 && auth ? (
                  member != null ? (
                    <Link href="/account" className={pill}>
                      Account
                    </Link>
                  ) : (
                    <>
                      <Link href="/register" className={pill}>
                        Register
                      </Link>
                      <Link href="/login" className={`${pill} ${authBusy ? "opacity-75" : ""}`}>
                        Sign in
                      </Link>
                    </>
                  )
                ) : null}
                <Link href={link.href} className={pill}>
                  {link.label}
                </Link>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
