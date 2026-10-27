import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ParticipationFeedbackLoop } from "@/components/civic/ParticipationFeedbackLoop";
import { PreLaunchLeadCaptureSection } from "@/components/forms/PreLaunchLeadCaptureSection";
import { isPublicLaunchPolishEnabled } from "@/lib/platform/launch-polish";
import { CitizensVoiceHubActions } from "@/components/voice/CitizensVoiceHubActions";
import { VoiceOpenChatCTA } from "@/components/voice/VoiceOpenChatCTA";
import { AccountabilityDisclaimerCallout } from "@/components/legal/AccountabilityDisclaimerCallout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProcessFlowDiagram, VOICE_REPORT_LIFECYCLE_STEPS } from "@/components/ui/ProcessFlowDiagram";
import { pageHeaderPresets } from "@/lib/page-header-presets";
import { Card } from "@/components/ui/Card";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import {
  isCivicPetitionsAndPublicCausesEnabled,
  isPublicVoiceStatisticsEnabled,
} from "@/lib/reports/accountability-pages";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { images } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const launchPolish = isPublicLaunchPolishEnabled();
  return {
    title: launchPolish ? "MBKRU Voice" : "Digital Platform — MBKRU Voice",
    description: launchPolish
      ? "Submit reports with evidence, track with a code, and manage submissions from your member account."
      : "Secure national membership portal. Registration, personal dashboard, geo-tagged complaints, public statistics.",
  };
}

const keyBenefits = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Secure Registration",
    description:
      "Register with email and password. MP performance reports require Ghana Card verification on your account (Hubtel / NIA check). Other Voice intakes stay open to signed-in members.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Geo-Tagged Complaints",
    description: "File complaints tagged to district, region, and constituency. Track responses by ministry, MDCE, and MP.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Public Dashboard",
    description: "Live statistics on complaints received, resolved, and response times. Transparency builds accountability.",
  },
];

export default async function CitizensVoicePage() {
  const launchPolish = isPublicLaunchPolishEnabled();
  const voiceOn = isCitizensVoiceEnabled();
  const showStats = isPublicVoiceStatisticsEnabled();
  const civicEngagement = isCivicPetitionsAndPublicCausesEnabled();

  const voicePreset = pageHeaderPresets.voice;

  return (
    <div>
      <PageHeader
        title={launchPolish ? "MBKRU Voice" : "Digital Platform — MBKRU Voice"}
        description={
          voiceOn
            ? civicEngagement
              ? launchPolish
                ? "Submit a report, track with your code, or sign in to manage submissions. Public causes may open for member discussion when staff publish them."
                : "Submit reports with evidence, track with a code, and manage submissions from your account. Selected reports may be published as public causes where members support and discuss — see Public causes."
              : launchPolish
                ? "Submit a report, track with your code, or sign in to manage submissions from your account."
                : "Submit reports with evidence, track with a code, and manage submissions from your account."
            : "Digital platform for citizen voice — membership portal, personal dashboard, and public statistics."
        }
        eyebrow={voicePreset.eyebrow}
        heroImage={voicePreset.heroImage}
        heroImageAlt={voicePreset.heroImageAlt}
      />

      <section className="section-spacing section-full bg-gradient-to-b from-[var(--section-light)] to-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AccountabilityDisclaimerCallout variant="voiceSubmit" className="mb-6" />
          {!launchPolish ? (
            <ProcessFlowDiagram
              className="mb-8"
              title="How a Voice report moves"
              steps={VOICE_REPORT_LIFECYCLE_STEPS}
            />
          ) : null}
          {voiceOn && launchPolish ? (
            <div className="mb-8">
              <CitizensVoiceHubActions showStats={showStats} civicEngagement={civicEngagement} />
            </div>
          ) : null}
          {!launchPolish ? (
            <>
              <div className="mb-4 lg:hidden">
                <VoiceOpenChatCTA />
              </div>
              <p className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)] sm:hidden">
                AI chat for questions — not for emergencies or legal advice.{" "}
                <Link href="/privacy" className={primaryLinkClass}>
                  Privacy
                </Link>
                {" · "}
                <Link href="/terms" className={primaryLinkClass}>
                  Terms
                </Link>
              </p>
              <div className="mb-6 hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm leading-relaxed text-[var(--foreground-secondary)] sm:block">
                MBKRU Voice includes reporting tools and an AI-assisted customer service chat experience. Do not use chat
                for legal strategy or emergency response. For urgent safety matters, contact local emergency services
                first. See{" "}
                <Link href="/privacy" className={primaryLinkClass}>
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className={primaryLinkClass}>
                  Terms of Use
                </Link>
                .
              </div>
            </>
          ) : (
            <p className="mb-6 text-sm leading-relaxed text-[var(--foreground-secondary)]">
              AI chat answers programme questions — not emergencies or legal advice.{" "}
              <Link href="/privacy" className={primaryLinkClass}>
                Privacy
              </Link>
              {" · "}
              <Link href="/terms" className={primaryLinkClass}>
                Terms
              </Link>
            </p>
          )}
          {launchPolish ? null : (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5">
              <Image
                src={images.digital}
                alt="Citizen using a phone to file a civic report in Ghana"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" aria-hidden />
            </div>
            <div>
              <span className="inline-block rounded-full bg-[var(--primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
                Pillar A
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                Digital Platform — &quot;MBKRU Voice&quot;
              </h2>
              <ul className="mt-6 space-y-3 text-[var(--foreground-secondary)]">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>File geo-tagged reports with evidence and track responses by code or account</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Personal dashboard for submissions, updates, and notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>
                    Public aggregate statistics on{" "}
                    {showStats ? (
                      <Link href="/transparency" className={primaryLinkClass}>
                        Voice statistics
                      </Link>
                    ) : (
                      "the transparency page"
                    )}{" "}
                    when published
                  </span>
                </li>
              </ul>
            </div>
          </div>
          )}
          {launchPolish ? <ParticipationFeedbackLoop className="mt-4" /> : null}
        </div>
      </section>

      {!launchPolish ? (
      <section className="section-spacing section-full bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[var(--accent-gold)]/15 px-4 py-1.5 text-sm font-medium text-[var(--accent-gold)]">
              Why Join
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              Key Benefits
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[var(--foreground-secondary)]">
              Secure, transparent, and accountable — built for every Ghanaian citizen.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {keyBenefits.map((item) => (
              <Card
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {voiceOn && !launchPolish ? (
        <section className="section-spacing section-full bg-[var(--section-dark)] text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Report intake</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-white/85">
              Submit a report and track it with a code. Staff may email you when the status changes.
              {civicEngagement ? (
                <>
                  {" "}
                  When a submission is opened as a public cause, it appears on Public causes so members can support and
                  comment.
                </>
              ) : null}
            </p>
            <CitizensVoiceHubActions showStats={showStats} civicEngagement={civicEngagement} />
          </div>
        </section>
      ) : null}

      <PreLaunchLeadCaptureSection
        variant="early-access"
        eyebrow="Early Access"
        title="Get Early Access"
        description="Be among the first to join MBKRU Voice. Register your email for early access."
      />
    </div>
  );
}
