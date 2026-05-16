import Link from "next/link";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { ACCOUNTABILITY_CATALOGUE_ROUTES } from "@/config/accountability-catalogue-destinations";
import { primaryLinkClass } from "@/lib/primary-link-styles";

/**
 * Shared copy for diaspora surfaces: what is live on this deployment vs phased accountability tools.
 */
export function DiasporaProgrammePhaseNotice() {
  const phase = getServerPlatformPhase();
  const accountabilityOn = platformFeatures.parliamentTrackerData(phase);
  const petitionsOn = platformFeatures.citizensVoicePlatform(phase);

  if (phase >= 2 && accountabilityOn) {
    return (
      <aside
        className="rounded-2xl border border-[var(--primary)]/25 bg-[var(--primary)]/[0.06] p-5 sm:p-6"
        aria-label="Programme phase"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">Phase {phase} — live tools</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">
          This deployment includes the public{" "}
          <strong className="font-semibold">accountability catalogue</strong> (documented government commitments and,
          where enabled, MP-linked promises). Diaspora supporters can use the same evidence base as citizens at home.
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[var(--muted-foreground)]">
          <li>
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments} className={primaryLinkClass}>
              Government commitments
            </Link>
          </li>
          {petitionsOn ? (
            <li>
              <Link href="/petitions" className={primaryLinkClass}>
                Petitions &amp; campaigns
              </Link>
            </li>
          ) : (
            <li>Petitions appear when the programme enables them on this host.</li>
          )}
          <li>
            <Link href="/methodology" className={primaryLinkClass}>
              Accountability methodology
            </Link>{" "}
            (People&apos;s Report Card framework and evidence rules).
          </li>
        </ul>
      </aside>
    );
  }

  return (
    <aside
      className="rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/80 p-5 sm:p-6"
      aria-label="Programme phase"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Phase 1 — foundation</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
        You can use this hub for <strong className="text-[var(--foreground)]">signposting</strong>,{" "}
        <strong className="text-[var(--foreground)]">policy context</strong>, and{" "}
        <strong className="text-[var(--foreground)]">structured feedback</strong>. The full public commitment catalogue,
        petitions surface, and partner data feeds follow the same{" "}
        <Link href="/methodology" className={primaryLinkClass}>
          phase rollout
        </Link>{" "}
        as the rest of MBKRU — programme staff can confirm what is enabled for your deployment.
      </p>
    </aside>
  );
}
