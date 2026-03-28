"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { useMemberMe } from "@/hooks/useMemberMe";

const pill =
  "inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)]";

const pillDark =
  "inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20";

export function LivePlatformStrip() {
  const pathname = usePathname();
  const phase = getPublicPlatformPhase();
  const voice = platformFeatures.citizensVoicePlatform(phase);
  const parliament = platformFeatures.parliamentTrackerData(phase);
  const scorecards = platformFeatures.accountabilityScorecards(phase);
  const legal = platformFeatures.legalEmpowermentDesk(phase);
  const townHalls = platformFeatures.townHallDirectory(phase);
  const auth = platformFeatures.authentication(phase);
  const { member, busy: authBusy } = useMemberMe(phase >= 2 && auth, pathname);

  if (phase < 2) {
    return (
      <section className="border-y border-[var(--border)] bg-[var(--section-light)]/90 py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm leading-relaxed text-[var(--muted-foreground)] sm:px-6 lg:px-8">
          <span className="font-semibold text-[var(--foreground)]">Phase 1 deployment.</span> News, contact, and waitlists
          are live. MBKRU Voice, campaign promises, report cards, and pillar pages activate when this site is built with{" "}
          <code className="rounded bg-white px-1 py-0.5 text-xs">NEXT_PUBLIC_PLATFORM_PHASE</code> ≥ 2 — see roadmap
          below.
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/[0.07] via-white to-[var(--accent-gold)]/[0.08] py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
          Live on this deployment
        </p>
        <p className="mx-auto mt-1 max-w-2xl text-center text-xs text-[var(--muted-foreground)]">
          Phase {phase} — tools below match your build. Accountability data and APIs follow the same flags.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {voice ? (
            <>
              <Link href="/citizens-voice/submit" className={pill}>
                Submit a report
              </Link>
              <Link href="/track-report" className={pill}>
                Track a report
              </Link>
            </>
          ) : null}
          {auth ? (
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
          {parliament ? (
            <Link href="/promises" className={pill}>
              Campaign promises
            </Link>
          ) : null}
          {scorecards ? (
            <Link href="/report-card" className={pill}>
              People&apos;s Report Card
            </Link>
          ) : null}
          <Link href="/methodology" className={pill}>
            Methodology
          </Link>
          {legal ? (
            <Link href="/legal-empowerment" className={pill}>
              Legal
            </Link>
          ) : null}
          {townHalls ? (
            <Link href="/town-halls" className={pill}>
              Forums
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Compact variant for dark hero backgrounds */
export function LivePlatformHeroChips() {
  const pathname = usePathname();
  const phase = getPublicPlatformPhase();
  const auth = platformFeatures.authentication(phase);
  const { member, busy: authBusy } = useMemberMe(phase >= 2 && auth, pathname);

  if (phase < 2) return null;

  const voice = platformFeatures.citizensVoicePlatform(phase);
  const parliament = platformFeatures.parliamentTrackerData(phase);
  const scorecards = platformFeatures.accountabilityScorecards(phase);

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {auth ? (
        member != null ? (
          <Link href="/account" className={pillDark}>
            Account
          </Link>
        ) : (
          <>
            <Link href="/register" className={pillDark}>
              Register
            </Link>
            <Link href="/login" className={`${pillDark} ${authBusy ? "opacity-75" : ""}`}>
              Sign in
            </Link>
          </>
        )
      ) : null}
      {voice ? (
        <>
          <Link href="/citizens-voice/submit" className={pillDark}>
            Submit a report
          </Link>
          <Link href="/track-report" className={pillDark}>
            Track
          </Link>
        </>
      ) : null}
      {parliament ? (
        <Link href="/promises" className={pillDark}>
          Promises
        </Link>
      ) : null}
      {scorecards ? (
        <Link href="/report-card" className={pillDark}>
          Report card
        </Link>
      ) : null}
    </div>
  );
}
