import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EarlyAccessForm } from "@/components/forms/EarlyAccessForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import {
  isCivicPetitionsAndPublicCausesEnabled,
  isPublicVoiceStatisticsEnabled,
} from "@/lib/reports/accountability-pages";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { images } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Digital Platform — MBKRU Voice",
  description:
    "Secure national membership portal. Registration, personal dashboard, geo-tagged complaints, public statistics.",
};

const keyBenefits = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Secure Registration",
    description:
      "Register with email and password today. Stronger identity checks (e.g. Ghana Card reference) may be added as the programme and law allow — your data is used only for civic engagement.",
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
  const voiceOn = isCitizensVoiceEnabled();
  const showStats = isPublicVoiceStatisticsEnabled();
  const civicEngagement = isCivicPetitionsAndPublicCausesEnabled();

  return (
    <div>
      <PageHeader
        title="Digital Platform — MBKRU Voice"
        description={
          voiceOn
            ? "Pilot live: submit reports with evidence, track with a code, and manage submissions from your account. Full national rollout scales with programme phases."
            : "Digital platform for citizen voice — membership portal, personal dashboard, and public statistics."
        }
      />

      {/* Hero section — full-width with hero image */}
      <section className="section-spacing section-full bg-gradient-to-b from-[var(--section-light)] to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5">
              <Image
                src={images.hero}
                alt="Citizens and community engagement"
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
              <ul className="mt-6 space-y-3 text-[var(--muted-foreground)]">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Secure national membership portal (mbkru.org.gh)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Register with email and password; eligibility is Ghanaian citizens 18+ — enhanced ID verification is on the roadmap</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Personal dashboard for filing complaints, tracking responses, and receiving updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Geo-tagged complaint system (district, region, constituency)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>
                    Public aggregate statistics (counts by kind, status, and region) on{" "}
                    {showStats ? (
                      <Link href="/transparency" className={primaryLinkClass}>
                        Voice statistics
                      </Link>
                    ) : (
                      "the transparency page"
                    )}{" "}
                    when the programme enables public statistics for this site
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits — full-width cards */}
      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[var(--accent-gold)]/15 px-4 py-1.5 text-sm font-medium text-[var(--accent-gold)]">
              Why Join
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              Key Benefits
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
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

      {voiceOn ? (
        <section className="section-spacing section-full bg-[var(--section-dark)] text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Pilot reporting</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-white/85">
              Phase 2 pilot: submit a report and track it with a code. Staff may email you when the status
              changes (if Resend is configured).
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/citizens-voice/submit"
                className="inline-flex rounded-xl bg-[var(--accent-gold)] px-6 py-3 text-sm font-semibold text-[var(--section-dark)] shadow-md hover:bg-[var(--accent-warm)]"
              >
                Submit a report
              </Link>
              <Link
                href="/track-report"
                className="inline-flex rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Track a report
              </Link>
              {showStats ? (
                <Link
                  href="/transparency"
                  className="inline-flex rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Public statistics
                </Link>
              ) : null}
              {civicEngagement ? (
                <>
                  <Link
                    href="/petitions"
                    className="inline-flex rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Petitions
                  </Link>
                  <Link
                    href="/citizens-voice/causes"
                    className="inline-flex rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Public causes
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Early Access — premium CTA card */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-[var(--primary)]/20 bg-white shadow-[var(--shadow-card)]">
            <div className="bg-gradient-to-r from-[var(--primary)]/5 via-white to-[var(--primary)]/5 px-6 py-8 sm:p-10">
              <span className="inline-block rounded-full bg-[var(--primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
                Early Access
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                Get Early Access
              </h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Be among the first to join MBKRU Voice. Register your email for early access.
              </p>
              <EarlyAccessForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
