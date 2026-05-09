"use client";

import Link from "next/link";
import { Fragment } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { getAboutPhaseQuickLinks } from "@/config/public-platform-nav";
import { useMemberMe } from "@/hooks/useMemberMe";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { sectionRevealTransition } from "@/lib/motion-reveal";
import { focusRingPillClass, focusRingSmClass } from "@/lib/primary-link-styles";

const pill = `inline-flex shrink-0 snap-start items-center whitespace-nowrap rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-[border-color,color,box-shadow,transform] duration-200 ease-out hover:border-[var(--primary)]/45 hover:text-[var(--primary)] hover:shadow-[var(--shadow-sm)] active:scale-[0.98] motion-reduce:active:scale-100 ${focusRingPillClass}`;

export function LivePlatformStrip() {
  const pathname = usePathname();
  const phase = getPublicPlatformPhase();
  const auth = platformFeatures.authentication(phase);
  const { member, busy: authBusy } = useMemberMe(phase >= 2 && auth, pathname);
  const toolLinks = getAboutPhaseQuickLinks(phase);
  const reducedMotion = usePrefersReducedMotion();

  if (phase < 2) {
    return (
      <motion.section
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px 0px" }}
        transition={sectionRevealTransition(reducedMotion)}
        className="border-y border-[var(--border)] bg-[var(--section-light)]/90 py-5 sm:py-6"
      >
        <div className="mx-auto max-w-3xl px-4 text-center text-sm leading-relaxed text-[var(--muted-foreground)] sm:px-6 lg:max-w-4xl lg:px-8">
          <span className="font-semibold text-[var(--foreground)]">Public information mode.</span> News, contact, and waitlists
          are live. {accountabilityProse.livePlatformStripPhase1}
        </div>
      </motion.section>
    );
  }

  return (
    <section className="border-y border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/[0.07] via-white to-[var(--accent-gold)]/[0.08] py-5 sm:py-6">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-24px 0px" }}
        transition={sectionRevealTransition(reducedMotion)}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <p
          id="live-deployment-tools-heading"
          className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]"
        >
          Live tools
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-[13px]">
          Shortcuts below reflect what is available on this site right now, including accountability browsing when it is
          enabled for visitors.
        </p>
        <p className="mb-2 mt-4 text-center text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)] sm:hidden">
          Swipe for more tools →
        </p>
        <div className="relative max-sm:[-webkit-mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-12px),transparent)] max-sm:[mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-12px),transparent)]">
          <div
            role="region"
            aria-labelledby="live-deployment-tools-heading"
            tabIndex={0}
            className={`-mx-4 flex flex-nowrap snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain scroll-smooth scroll-pl-4 scroll-pr-4 px-4 pb-1.5 pt-0.5 outline-none motion-reduce:snap-none motion-reduce:scroll-auto [scrollbar-gutter:stable] [scrollbar-width:thin] sm:-mx-6 sm:gap-2.5 sm:px-6 sm:scroll-pl-6 sm:scroll-pr-6 lg:-mx-8 lg:px-8 lg:scroll-pl-8 lg:scroll-pr-8 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--primary)]/35 ${focusRingSmClass}`}
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
      </motion.div>
    </section>
  );
}
