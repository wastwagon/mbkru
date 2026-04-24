"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/Button";
import { getAccountabilityParticipateHubTiles } from "@/config/accountability-catalogue-destinations";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { homeAtAGlanceHasLiveContent, type HomeAtAGlanceData } from "@/lib/home-at-a-glance-types";
import { sectionRevealTransition } from "@/lib/motion-reveal";
import { primaryLinkClass, primaryNavLinkClass, resourceTitleLinkClass } from "@/lib/primary-link-styles";

function townHallStatusLabel(status: string): string {
  switch (status) {
    case "TBC":
      return "TBC";
    case "SCHEDULED":
      return "Scheduled";
    case "COMPLETED":
      return "Done";
    default:
      return status;
  }
}

function formatEventDate(iso: string | null): string {
  if (!iso) return "Date TBC";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Phase 1 — marketing routes only; no DB-backed teasers. */
const PHASE_1_PARTICIPATE_ACTIONS: { href: string; title: string; body: string }[] = [
  {
    href: "/about",
    title: "About MBKRU",
    body: "Mission, five pillars, executive summary, and how the programme fits together.",
  },
  {
    href: "/citizens-voice",
    title: "MBKRU Voice (preview)",
    body: "What citizen reporting will look like when Phase 2 intake is enabled on this deployment.",
  },
  {
    href: "/parliament-tracker",
    title: "Accountability hub",
    body: "How we approach MPs, promises, and report cards — preview content in Phase 1.",
  },
  {
    href: "/situational-alerts",
    title: "Situational alerts",
    body: "How time-sensitive local signals will work alongside Voice when your build enables them.",
  },
  {
    href: "/track-report",
    title: "Track a report (preview)",
    body: "Explainer for tracking codes — full flow activates with MBKRU Voice in Phase 2+.",
  },
  {
    href: "/news",
    title: "News",
    body: "Press releases and programme updates from the MBKRU newsroom.",
  },
  {
    href: "/contact",
    title: "Contact",
    body: "Partnerships, media, and general enquiries — we aim to respond within two business days.",
  },
  {
    href: "/diaspora",
    title: "Diaspora",
    body: "How the African diaspora can connect with the accountability mission.",
  },
  {
    href: "/diaspora/feedback",
    title: "Diaspora feedback",
    body: "Structured experience and input form when the diaspora surface is live.",
  },
  {
    href: "/methodology",
    title: "Methodology",
    body: "How we cite sources, score promises, and describe limitations.",
  },
  {
    href: "/resources",
    title: "Resources",
    body: "Published documents and downloads when editors release them.",
  },
  {
    href: "/data-sources",
    title: "Data sources",
    body: "Provenance for constituencies, MPs, and public datasets we reference.",
  },
  {
    href: "/faq",
    title: "FAQ",
    body: "Common questions about MBKRU, membership, and the platform roadmap.",
  },
  {
    href: "/partners",
    title: "Partners",
    body: "How institutions and foundations can align with the programme.",
  },
];

type Props = {
  data: HomeAtAGlanceData;
  /** When false, hides the DB-backed “Top petitions / causes / communities / forums” preview grid (homepage). */
  showLiveHighlights?: boolean;
};

export function HomeParticipateHub({ data, showLiveHighlights = true }: Props) {
  const phase = getPublicPlatformPhase();
  const phase1 = phase < 2;
  const voice = platformFeatures.citizensVoicePlatform(phase);
  const civic = platformFeatures.citizensVoicePlatform(phase);
  const communitiesOn = platformFeatures.communities(phase);
  const townsOn = platformFeatures.townHallDirectory(phase);
  const parliament = platformFeatures.parliamentTrackerData(phase);
  const reportCard = platformFeatures.publicReportCard(phase);
  const voiceStats = platformFeatures.publicVoiceStatistics(phase);
  const election = platformFeatures.electionObservatory(phase);
  const legal = platformFeatures.legalEmpowermentDesk(phase);
  const situational = platformFeatures.situationalAlertsSystem(phase);
  const whistle = platformFeatures.whistleblowerGuidance(phase);

  const live = !phase1 && homeAtAGlanceHasLiveContent(data);

  const actions = phase1
    ? PHASE_1_PARTICIPATE_ACTIONS
    : ([
    voice
      ? {
          href: "/citizens-voice/submit",
          title: "Submit a report",
          body: "File through MBKRU Voice with evidence when your build enables intake.",
        }
      : null,
    voice
      ? {
          href: "/track-report",
          title: "Track a report",
          body: "Use your tracking code to follow triage and updates.",
        }
      : null,
    civic
      ? {
          href: "/petitions",
          title: "Petitions",
          body: "Browse open campaigns or start your own after sign-in.",
        }
      : null,
    civic
      ? {
          href: "/petitions/new",
          title: "New petition",
          body: "Members can launch a signature drive on an issue.",
        }
      : null,
    civic
      ? {
          href: "/citizens-voice/causes",
          title: "Public causes",
          body: "Editor-approved Voice threads open for support and discussion.",
        }
      : null,
    communitiesOn
      ? {
          href: "/communities",
          title: "Communities",
          body: "Queen Mother & traditional-area spaces — join rules vary.",
        }
      : null,
    townsOn
      ? {
          href: "/town-halls",
          title: "Town halls & forums",
          body: "Programme directory for listening sessions and regional forums.",
        }
      : situational
        ? {
            href: "/situational-alerts",
            title: "Situational alerts",
            body: "Time-sensitive local signals for staff triage.",
          }
        : null,
    townsOn
      ? {
          href: "/debates",
          title: "Constituency debates",
          body: "Roadmap placeholders toward nationwide debate coverage.",
        }
      : null,
    ...(parliament
      ? Object.values(getAccountabilityParticipateHubTiles()).map((t) => ({
          href: t.href,
          title: t.title,
          body: t.body,
        }))
      : []),
    reportCard
      ? {
          href: "/report-card",
          title: "People's Report Card",
          body: "Published accountability cycles and scorecard rows.",
        }
      : null,
    voiceStats
      ? {
          href: "/transparency",
          title: "Voice statistics",
          body: "Aggregate counts — no personal data or full report text.",
        }
      : null,
    election
      ? {
          href: "/election-observation",
          title: "Election observation",
          body: "Dedicated election-window reporting when Phase 3 is enabled.",
        }
      : null,
    legal
      ? {
          href: "/legal-empowerment",
          title: "Legal empowerment",
          body: "Guidance and referrals for administrative and rights issues.",
        }
      : null,
    whistle
      ? {
          href: "/whistleblowing",
          title: "Whistleblower guidance",
          body: "How to escalate serious wrongdoing safely and what MBKRU can and cannot do.",
        }
      : null,
    {
      href: "/diaspora/feedback",
      title: "Diaspora feedback",
      body: "Share experience and programme input from outside Ghana.",
    },
  ].filter(Boolean) as { href: string; title: string; body: string }[]);

  const reducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="participate"
      className="section-full border-b border-[var(--border)] bg-gradient-to-b from-[var(--section-light)] to-white py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px 0px" }}
          transition={sectionRevealTransition(reducedMotion)}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Participate &amp; explore</p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[var(--foreground)] sm:mt-4 sm:text-3xl">
            {phase1 ? "Explore MBKRU in Phase 1" : "How to use MBKRU on this deployment"}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            {phase1 ? (
              <>
                This build is in <strong className="text-[var(--foreground)]">Phase 1</strong> (awareness and trust). Use
                the cards to learn what is coming, contact the team, and read published materials. When the programme
                enables Phases 2 or 3 on this site and connects the live database, petitions, communities, and tracker
                highlights appear here automatically — the same routes and rules as the dedicated index pages.
              </>
            ) : (
              <>
                Below matches the same public routes and data rules as our dedicated index pages — pick an action, or skim
                live highlights when your phase and database expose them.
              </>
            )}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-12 lg:grid-cols-3 xl:grid-cols-4">
          {actions.map((a, i) => (
            <motion.div
              key={a.href}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-28px 0px" }}
              transition={sectionRevealTransition(reducedMotion, Math.min(i * 0.04, 0.2))}
              whileHover={reducedMotion ? undefined : { y: -3 }}
              whileTap={reducedMotion ? undefined : { scale: 0.99 }}
            >
              <Link
                href={a.href}
                className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-card)] sm:p-5"
              >
                <span className="font-display text-sm font-semibold text-[var(--foreground)]">{a.title}</span>
                <span className="mt-2.5 text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-[13px]">{a.body}</span>
                <span className="mt-auto pt-3 text-xs font-semibold text-[var(--primary)]">Open →</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {!phase1 && data.voiceTotals != null && data.voiceTotals.totalReports > 0 ? (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-24px 0px" }}
            transition={sectionRevealTransition(reducedMotion, 0.05)}
            className="mt-10 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/[0.06] px-4 py-5 text-center sm:mt-12 sm:px-6"
          >
            <p className="text-sm text-[var(--foreground)]">
              <span className="font-display text-2xl font-bold tabular-nums text-[var(--primary)]">
                {data.voiceTotals.totalReports}
              </span>
              <span className="ml-2 font-medium">reports received through MBKRU Voice (all time, this deployment).</span>
            </p>
            {voiceStats ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                <Link href="/transparency" className={`${primaryLinkClass} font-semibold`}>
                  View aggregate Voice statistics
                </Link>
              </p>
            ) : null}
          </motion.div>
        ) : null}

        {phase1 ? (
          <p className="mt-10 text-center text-sm leading-relaxed text-[var(--muted-foreground)] sm:mt-12">
            Scroll the roadmap section below for programme milestones. For full narrative and restorative justice context,{" "}
            <Link href="/about" className={`${primaryLinkClass} font-semibold`}>
              open About
            </Link>
            .
          </p>
        ) : !showLiveHighlights ? (
          <p className="mt-10 text-center text-sm leading-relaxed text-[var(--muted-foreground)] sm:mt-12">
            Use the action cards above for the main routes. Open petitions, public causes, communities, and programme rows
            are also listed on their dedicated index pages.
          </p>
        ) : !live ? (
          <p className="mt-10 text-center text-sm leading-relaxed text-[var(--muted-foreground)] sm:mt-12">
            Live highlights (petitions, causes, communities, forums) appear here once editors publish content — action
            cards above are always aligned with your platform phase.
          </p>
        ) : (
          <div className="mt-12 grid gap-8 sm:gap-10 lg:grid-cols-2">
            {data.petitions != null ? (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-24px 0px" }}
                transition={sectionRevealTransition(reducedMotion)}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Top petitions</h3>
                  <Link href="/petitions" className={`${primaryNavLinkClass} shrink-0 text-sm font-semibold`}>
                    All →
                  </Link>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Open campaigns ranked by confirmed signatures.</p>
                {data.petitions.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted-foreground)]">No open petitions yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {data.petitions.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/petitions/${encodeURIComponent(p.slug)}`} className={resourceTitleLinkClass}>
                          {p.title}
                        </Link>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {p.signatureCount} signature{p.signatureCount === 1 ? "" : "s"}
                          {p.targetSignatures != null ? ` · goal ${p.targetSignatures}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <Button href="/petitions/new" className="mt-5 w-full sm:w-auto" variant="outline">
                  Start a petition
                </Button>
              </motion.div>
            ) : null}

            {data.publicCauses != null ? (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-24px 0px" }}
                transition={sectionRevealTransition(reducedMotion, 0.04)}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Public causes</h3>
                  <Link href="/citizens-voice/causes" className={`${primaryNavLinkClass} shrink-0 text-sm font-semibold`}>
                    All →
                  </Link>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Summaries only — not full Voice intake text.</p>
                {data.publicCauses.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted-foreground)]">No open causes yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {data.publicCauses.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/citizens-voice/causes/${encodeURIComponent(c.slug)}`} className={resourceTitleLinkClass}>
                          {c.title}
                        </Link>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {c.supportCount} support · {c.commentCount} comments
                          {c.regionName ? ` · ${c.regionName}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ) : null}

            {data.communities != null ? (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-24px 0px" }}
                transition={sectionRevealTransition(reducedMotion, 0.05)}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Communities</h3>
                  <Link href="/communities" className={`${primaryNavLinkClass} shrink-0 text-sm font-semibold`}>
                    Browse →
                  </Link>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Active spaces with the most members first.</p>
                {data.communities.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted-foreground)]">No listed communities yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {data.communities.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/communities/${encodeURIComponent(c.slug)}`} className={resourceTitleLinkClass}>
                          {c.name}
                        </Link>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {c.memberCount} member{c.memberCount === 1 ? "" : "s"}
                          {c.regionName ? ` · ${c.regionName}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ) : null}

            {data.townHalls != null ? (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-24px 0px" }}
                transition={sectionRevealTransition(reducedMotion, 0.06)}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">Forums &amp; programme rows</h3>
                  <div className="flex flex-wrap gap-3 text-sm font-semibold">
                    <Link href="/town-halls" className={`${primaryNavLinkClass} text-sm font-semibold`}>
                      Town halls
                    </Link>
                    <Link href="/debates" className={`${primaryNavLinkClass} text-sm font-semibold`}>
                      Debates
                    </Link>
                  </div>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Same ordered programme feed as the directory pages.</p>
                {data.townHalls.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--muted-foreground)]">No programme rows in the database yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {data.townHalls.map((ev) => (
                      <li key={ev.slug} className="text-sm">
                        <span className="font-medium text-[var(--foreground)]">{ev.title}</span>
                        <span className="text-[var(--muted-foreground)]"> · {ev.kindLabel}</span>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {formatEventDate(ev.startsAt)} · {townHallStatusLabel(ev.status)}
                          {ev.regionName ? ` · ${ev.regionName}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ) : null}
          </div>
        )}

        {!phase1 && data.reportCard != null ? (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-24px 0px" }}
            transition={sectionRevealTransition(reducedMotion, 0.04)}
            className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/80 p-5 text-center sm:mt-12 sm:p-6"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">People&apos;s Report Card</p>
            <p className="mt-2 font-display text-xl font-bold text-[var(--foreground)]">
              {data.reportCard.label}{" "}
              <span className="text-[var(--muted-foreground)]">({data.reportCard.year})</span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {data.reportCard.entryCount} published scorecard row{data.reportCard.entryCount === 1 ? "" : "s"} in this cycle.
            </p>
            <Button href={`/report-card/${data.reportCard.year}`} className="mt-4">
              View cycle
            </Button>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
