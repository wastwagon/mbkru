import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EarlyAccessForm } from "@/components/forms/EarlyAccessForm";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { images } from "@/lib/site-content";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { isSituationalAlertsIntakeEnabled } from "@/lib/reports/situational-alerts-gate";

export const metadata: Metadata = {
  title: "Physical Engagement Network",
  description:
    "Quarterly Town Hall Meetings, Regional Public Forums, Annual National People's Assembly.",
};

const howItWorks = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Quarterly Town Hall Meetings",
    description: "Community Town Hall Meetings in every district. Citizens raise issues directly with local leaders and MDCEs.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: "Regional Public Forums",
    description: "Broadcast live on radio, TV, and social media. Regional issues reach a national audience.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "National People's Assembly",
    description: "Annual assembly convened in rotation across the 16 regions. Selected members present priority issues directly to the President or his representative.",
  },
];

export default async function SituationalAlertsPage() {
  const intakeOn = isSituationalAlertsIntakeEnabled() && isCitizensVoiceEnabled();

  return (
    <div>
      <PageHeader
        title="Physical Engagement Network"
        description="Physical engagement network — Town Hall Meetings, Regional Forums, and National People's Assembly."
      />

      {/* Hero section — full-width with hero image */}
      <section className="section-spacing section-full bg-gradient-to-b from-[var(--section-light)] to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 lg:order-2">
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
            <div className="lg:order-1">
              <span className="inline-block rounded-full bg-[var(--primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
                Pillar B
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                Physical Engagement Network
              </h2>
              <ul className="mt-6 space-y-3 text-[var(--muted-foreground)]">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Quarterly Community Town Hall Meetings in every district</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Regional Public Forums broadcast live on radio, TV, and social media</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Annual National People&apos;s Assembly (convened in rotation across the 16 regions) where selected members present priority issues directly to the President or his representative</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — full-width cards */}
      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[var(--accent-gold)]/15 px-4 py-1.5 text-sm font-medium text-[var(--accent-gold)]">
              Face-to-Face
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              How It Works
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
              From district Town Halls to the National People&apos;s Assembly — citizens meet decision-makers directly.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((item) => (
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

      {intakeOn ? (
        <section className="section-spacing section-full bg-[var(--section-dark)] text-white">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Situational alerts (pilot)</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-white/85">
              Submit a time-sensitive local alert for our team to review. You will get a tracking code; we do not
              publish raw submissions. Use MBKRU Voice for general civic reports.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/situational-alerts/submit"
                className="inline-flex rounded-xl bg-[var(--accent-gold)] px-6 py-3 text-sm font-semibold text-[var(--section-dark)] shadow-md hover:bg-[var(--accent-warm)]"
              >
                Submit situational alert
              </Link>
              <Link
                href="/track-report"
                className="inline-flex rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Track a submission
              </Link>
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
                Be among the first to join the Physical Engagement Network. Register your email for early access.
              </p>
              <EarlyAccessForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
