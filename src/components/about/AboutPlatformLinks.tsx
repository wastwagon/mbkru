import Link from "next/link";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import {
  isLegalEmpowermentPageEnabled,
  isPromisesBrowseEnabled,
  isPublicVoiceStatisticsEnabled,
  isReportCardPublicEnabled,
  isTownHallDirectoryPageEnabled,
} from "@/lib/reports/accountability-pages";

const pill =
  "inline-flex rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)]";

export async function AboutPlatformLinks() {
  const phase = getServerPlatformPhase();
  if (phase < 2) {
    return (
      <section className="border-b border-[var(--border)] bg-[var(--section-light)]/80 py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-[var(--muted-foreground)] sm:px-6 lg:px-8">
          This deployment is <strong className="text-[var(--foreground)]">Phase 1</strong> (editorial + leads). Voice,
          promises, and report-card tools appear when the site is built as Phase 2 or 3.
        </div>
      </section>
    );
  }

  const voice = platformFeatures.citizensVoicePlatform(phase);
  const parliament = platformFeatures.parliamentTrackerData(phase);

  return (
    <section className="border-b border-[var(--primary)]/15 bg-gradient-to-r from-[var(--primary)]/[0.06] to-[var(--accent-gold)]/[0.06] py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
          Live platform (Phase {phase})
        </p>
        <p className="mx-auto mt-1 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">
          Explore tools that match this deployment — same gates as the homepage strip.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {voice ? (
            <>
              <Link href="/citizens-voice/submit" className={pill}>
                Submit a report
              </Link>
              <Link href="/track-report" className={pill}>
                Track a report
              </Link>
              {isPublicVoiceStatisticsEnabled() ? (
                <Link href="/transparency" className={pill}>
                  Voice statistics
                </Link>
              ) : null}
            </>
          ) : null}
          {parliament && isPromisesBrowseEnabled() ? (
            <Link href="/promises" className={pill}>
              Campaign promises
            </Link>
          ) : null}
          {isReportCardPublicEnabled() ? (
            <Link href="/report-card" className={pill}>
              Report card
            </Link>
          ) : null}
          <Link href="/methodology" className={pill}>
            Methodology
          </Link>
          {isLegalEmpowermentPageEnabled() ? (
            <Link href="/legal-empowerment" className={pill}>
              Legal
            </Link>
          ) : null}
          {isTownHallDirectoryPageEnabled() ? (
            <>
              <Link href="/town-halls" className={pill}>
                Forums
              </Link>
              <Link href="/debates" className={pill}>
                Debates
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
