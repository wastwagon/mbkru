import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PromiseTrackerStatsStrip } from "@/components/accountability/PromiseTrackerStatsStrip";
import { TrackerSignupForm } from "@/components/forms/TrackerSignupForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { images } from "@/lib/site-content";
import {
  isPartnerApiTermsPageEnabled,
  isPromisesBrowseEnabled,
  isReportCardPublicEnabled,
} from "@/lib/reports/accountability-pages";
import { getCachedMpsPublicRoster } from "@/lib/server/accountability-cache";
import { getPromiseTrackerStats } from "@/lib/server/promise-tracker-stats";

export const metadata: Metadata = {
  title: "Accountability & Electoral Watch",
  description:
    "People's Report Card, campaign promise tracking, Accountability Scorecards, citizen petition mechanism.",
};

const accountabilityStepIcons = {
  reportCard: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  promises: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  scorecards: (
    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
} as const;

export default async function ParliamentTrackerPage() {
  const showPromises = isPromisesBrowseEnabled();
  const showReportCard = isReportCardPublicEnabled();
  const partnerDataPage = isPartnerApiTermsPageEnabled();

  const dbReady = isDatabaseConfigured();
  const [trackerStats, mpRoster] = dbReady
    ? await Promise.all([getPromiseTrackerStats("all"), getCachedMpsPublicRoster()])
    : [null, [] as Awaited<ReturnType<typeof getCachedMpsPublicRoster>>];

  const accountabilityTools = [
    {
      icon: accountabilityStepIcons.reportCard,
      title: "People's Report Card",
      description:
        "Annual report card on every Minister, Regional Minister, and MP. Data-driven performance assessment.",
      href: showReportCard ? "/report-card" : undefined,
      badge: showReportCard ? ("Live" as const) : undefined,
    },
    {
      icon: accountabilityStepIcons.promises,
      title: "Campaign Promise Tracking",
      description: "Real-time tracking of campaign promises versus delivery. Hold elected officials to their word.",
      href: showPromises ? "/promises/browse" : undefined,
      badge: showPromises ? ("Live" as const) : undefined,
    },
    {
      icon: accountabilityStepIcons.scorecards,
      title: "Accountability Scorecards",
      description:
        "Published 90 days before every general election. Pre-election debates and town halls in every constituency.",
      href: "/methodology",
      badge: undefined,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Accountability & Electoral Watch"
        description="Accountability & Electoral Watch — People's Report Cards, campaign tracking, and Accountability Scorecards."
      />

      {dbReady && trackerStats ? (
        <section className="section-spacing section-full bg-[var(--section-light)] pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <PromiseTrackerStatsStrip
              stats={trackerStats}
              subtitle="Use Browse promises for live filters; roster below lists every active MP in the database (including zero-promise rows)."
            />
            <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-[var(--foreground)]">Parliamentary roster</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {mpRoster.length} active MP{mpRoster.length === 1 ? "" : "s"} in this catalogue. Open promise pages from
                    the list, or{" "}
                    {partnerDataPage ? (
                      <>
                        see{" "}
                        <Link href="/partner-api" className="text-[var(--primary)] hover:underline">
                          Partner data &amp; API
                        </Link>{" "}
                        for machine-readable exports of the same roster.
                      </>
                    ) : (
                      "ask the team if you need a machine-readable export of this roster."
                    )}
                  </p>
                </div>
                {showPromises ? (
                  <Link
                    href="/promises"
                    className="text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    Promises by MP →
                  </Link>
                ) : null}
              </div>
              {mpRoster.length === 0 ? (
                <p className="mt-6 text-sm text-[var(--muted-foreground)]">
                  No parliamentarians are listed yet. They will appear here once the programme publishes a roster for
                  this site.
                </p>
              ) : (
                <ul className="mt-6 max-h-[min(28rem,55vh)] divide-y divide-[var(--border)] overflow-y-auto rounded-xl border border-[var(--border)]">
                  {mpRoster.map((m) => (
                    <li key={m.slug} className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5 text-sm hover:bg-[var(--section-light)]/50">
                      <div className="min-w-0">
                        {showPromises && m.promiseCount > 0 ? (
                          <Link
                            href={`/promises/${encodeURIComponent(m.slug)}`}
                            className="font-medium text-[var(--primary)] hover:underline"
                          >
                            {m.name}
                          </Link>
                        ) : (
                          <span className="font-medium text-[var(--foreground)]">{m.name}</span>
                        )}
                        <span className="text-[var(--muted-foreground)]">
                          {" "}
                          · {m.role}
                          {m.party ? ` · ${m.party}` : ""}
                          {m.constituencyName ? ` · ${m.constituencyName}` : ""}
                        </span>
                      </div>
                      <span className="shrink-0 tabular-nums text-xs text-[var(--muted-foreground)]">
                        {m.promiseCount} promise{m.promiseCount === 1 ? "" : "s"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {/* Hero section — full-width with hero image */}
      <section className="section-spacing section-full bg-gradient-to-b from-[var(--section-light)] to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5">
              <Image
                src={images.hero}
                alt="Citizens and accountability"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" aria-hidden />
            </div>
            <div>
              <span className="inline-block rounded-full bg-[var(--primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
                Pillar D
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                Accountability & Electoral Watch
              </h2>
              <ul className="mt-6 space-y-3 text-[var(--muted-foreground)]">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Annual &quot;People&apos;s Report Card&quot; on every Minister, Regional Minister, and MP</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Real-time tracking of campaign promises versus delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Pre-election public debates and town halls in every constituency</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Publication of &quot;Accountability Scorecards&quot; 90 days before every general election</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span>Citizen petition mechanism to recall non-performing MPs under existing constitutional provisions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Accountability Tools — full-width cards */}
      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[var(--accent-gold)]/15 px-4 py-1.5 text-sm font-medium text-[var(--accent-gold)]">
              Tools
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
              Accountability Tools
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[var(--muted-foreground)]">
              Data-driven tools to hold elected officials accountable to their promises.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {accountabilityTools.map((item) => (
              <Card
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                href={item.href}
                badge={item.badge}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Tracker signup — premium CTA card */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-[var(--primary)]/20 bg-white shadow-[var(--shadow-card)]">
            <div className="bg-gradient-to-r from-[var(--primary)]/5 via-white to-[var(--primary)]/5 px-6 py-8 sm:p-10">
              <span className="inline-block rounded-full bg-[var(--primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
                Stay Informed
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                Get Tracker Notifications
              </h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Receive updates on People&apos;s Report Cards, Accountability Scorecards, and campaign promise tracking.
              </p>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <Link href="/methodology" className="font-medium text-[var(--primary)] hover:underline">
                  Methodology
                </Link>
                {showPromises ? (
                  <>
                    <Link href="/promises" className="font-medium text-[var(--primary)] hover:underline">
                      Promises by MP
                    </Link>
                    <Link href="/promises/browse" className="font-medium text-[var(--primary)] hover:underline">
                      Browse &amp; filter
                    </Link>
                  </>
                ) : null}
                {showReportCard ? (
                  <Link href="/report-card" className="font-medium text-[var(--primary)] hover:underline">
                    Report card
                  </Link>
                ) : null}
              </p>
              <TrackerSignupForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
