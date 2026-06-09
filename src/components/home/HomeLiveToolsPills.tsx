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

/** Horizontal live-tool shortcuts — merged from the former homepage live strip. */
export function HomeLiveToolsPills() {
  const pathname = usePathname();
  const phase = getPublicPlatformPhase();
  const phase1 = phase < 2;
  const auth = platformFeatures.authentication(phase);
  const { member, busy: authBusy } = useMemberMe(phase >= 2 && auth, pathname);
  const toolLinks = getAboutPhaseQuickLinks(phase);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-24px 0px" }}
      transition={sectionRevealTransition(reducedMotion)}
      className="mt-8 rounded-2xl border border-[var(--primary)]/15 bg-white/80 px-4 py-5 sm:mt-10 sm:px-6"
    >
      {!phase1 ? (
        <>
          <p
            id="home-live-tools-heading"
            className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]"
          >
            Live on this site now
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-center text-xs leading-relaxed text-[var(--foreground-secondary)] sm:text-[13px]">
            Quick shortcuts to tools currently available — including accountability browsing when enabled.
          </p>
          <p className="mb-2 mt-4 text-center text-[10px] font-medium uppercase tracking-wide text-[var(--foreground-secondary)] sm:hidden">
            Swipe for more →
          </p>
          <div className="relative max-sm:[-webkit-mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-12px),transparent)] max-sm:[mask-image:linear-gradient(90deg,transparent,#000_12px,#000_calc(100%-12px),transparent)]">
            <div
              role="region"
              aria-labelledby="home-live-tools-heading"
              tabIndex={0}
              className={`-mx-1 flex flex-nowrap snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain scroll-smooth scroll-pl-1 scroll-pr-1 px-1 pb-1.5 pt-0.5 outline-none motion-reduce:snap-none motion-reduce:scroll-auto [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--primary)]/35 ${focusRingSmClass}`}
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
        </>
      ) : (
        <p className="text-center text-sm leading-relaxed text-[var(--foreground-secondary)]">
          <span className="font-semibold text-[var(--foreground)]">Some tools are still rolling out.</span> News, contact,
          and programme information are live today. {accountabilityProse.livePlatformStripPhase1}
        </p>
      )}
    </motion.div>
  );
}
