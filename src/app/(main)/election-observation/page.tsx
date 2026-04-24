import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Election observation",
  description:
    "How MBKRU collects non-partisan election-window situational reports — not EC or court filings.",
};

export default function ElectionObservationPage() {
  const phase = getServerPlatformPhase();
  if (!platformFeatures.electionObservatory(phase)) notFound();

  const submitElectionHref = isCitizensVoiceEnabled()
    ? "/citizens-voice/submit/election"
    : "/citizens-voice";

  return (
    <div>
      <PageHeader
        title="Election observation"
        description="During Phase 3 deployments, MBKRU accepts dedicated election-window reports alongside Voice and situational channels. Submissions are moderated; they are not filings with the Electoral Commission or courts."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <ul className="list-inside list-disc space-y-3 text-sm leading-relaxed text-[var(--foreground)]">
            <li>Use the dedicated form so your report is tagged for election-season review.</li>
            <li>Save your tracking code — staff may follow up only where policy allows.</li>
            <li>
              Read our{" "}
              <Link href="/methodology" className={primaryLinkClass}>
                methodology
              </Link>{" "}
              for how we handle evidence and limitations.
            </li>
          </ul>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href={submitElectionHref} className="w-full justify-center sm:w-auto">
              Submit an election observation report
            </Button>
            <Button href="/track-report" variant="secondary" className="w-full justify-center sm:w-auto">
              Track a report
            </Button>
          </div>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/citizens-voice" className={primaryNavLinkClass}>
              ← MBKRU Voice
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link href="/situational-alerts" className={primaryNavLinkClass}>
              Engagement
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
