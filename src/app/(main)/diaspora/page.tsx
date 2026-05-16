import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DiasporaProgrammePhaseNotice } from "@/components/diaspora/DiasporaProgrammePhaseNotice";
import { PageHeader } from "@/components/ui/PageHeader";
import { MbkruVoiceCallout } from "@/components/voice/MbkruVoiceCallout";
import { Card } from "@/components/ui/Card";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";
import { images } from "@/lib/site-content";
import { ACCOUNTABILITY_CATALOGUE_ROUTES, accountabilityCatalogueNavMedium } from "@/config/accountability-catalogue-destinations";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";

export const metadata: Metadata = {
  title: "Diaspora support — pathways to documentation & accountability",
  description:
    "Practical signposting for Ghanaians in the diaspora: Ghana Card, passport, nationality, and how to collaborate with MBKRU on citizen accountability. Not legal advice—verify on official government channels.",
};

const ctaClass = `inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${focusRingSmClass}`;

const official = {
  nia: { label: "National Identification Authority (Ghana Card)", href: "https://www.nia.gov.gh/" },
  gis: { label: "Ghana Immigration Service", href: "https://www.gis.gov.gh/" },
  mfa: { label: "Ministry of Foreign Affairs & Regional Integration", href: "https://mfa.gov.gh/" },
  ghanaGov: { label: "Ghana government portal (verify current services)", href: "https://www.ghana.gov.gh/" },
} as const;

const collaborate = [
  {
    title: "Track government promises",
    body: "Use the public catalogue to see documented commitments and evidence—diaspora voices can push for the same transparency as at home.",
    href: ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments,
    label: accountabilityCatalogueNavMedium.government,
  },
  {
    title: "Petitions & campaigns",
    body: "Where petitions are available, start or support citizen-led campaigns on issues that matter to you and to communities in Ghana.",
    href: "/petitions",
    label: "Petitions",
  },
  {
    title: "Report & feedback",
    body: "Share structured experience through our diaspora feedback form so we can improve signposting and programmes.",
    href: "/diaspora/feedback",
    label: "Diaspora feedback",
  },
  {
    title: "Partners & media",
    body: "Associations, professionals, and faith groups aligned with non-partisan accountability can reach us for collaboration.",
    href: "/partners",
    label: "Partners",
  },
] as const;

export default function DiasporaPage() {
  const phase = getServerPlatformPhase();
  const accountabilityOn = platformFeatures.parliamentTrackerData(phase);
  const petitionsOn = platformFeatures.citizensVoicePlatform(phase);
  const legalDeskOn = platformFeatures.legalEmpowermentDesk(phase);

  const journeys = [
    {
      title: "Ghana Card (NIA)",
      summary:
        "The national ID underpins many services. Requirements and locations change—use NIA for eligibility, foreign missions, and registration steps.",
      steps: [
        "Start on the NIA site for the latest registration categories, fees, and mission coverage.",
        "If you are abroad, confirm which steps can be done at a mission or require travel to Ghana.",
        "Keep personal documents secure; never share one-time pins or pay unofficial “agents” without verification.",
      ],
      primary: official.nia,
    },
    {
      title: "Passport & travel documents",
      summary:
        "Passport applications and renewals are handled through official immigration and foreign-affairs channels. Processing times and forms change—always use current portals.",
      steps: [
        "Use the Ministry of Foreign Affairs and Ghana Immigration Service for authoritative instructions.",
        "Book appointments only through official links; verify mission addresses and hours on government sites.",
        "For urgent or complex cases, consular staff are the first point of contact—not social media offers.",
      ],
      primary: official.mfa,
      secondary: official.gis,
    },
    {
      title: "Nationality, citizenship & dual status",
      summary: "Rules depend on your situation, parentage, and when you obtained other nationalities. MBKRU does not provide legal advice.",
      steps: [
        "Read high-level guidance on official sites, then consult a qualified professional for your case.",
        legalDeskOn
          ? "Our Legal empowerment section lists signposting resources; it does not replace a lawyer for individual advice."
          : "When your site build enables it, we link a Legal empowerment desk for signposting—not a substitute for a lawyer.",
        "Document timelines and keep copies of submissions when you deal with public institutions.",
      ],
      primary: official.mfa,
    },
  ] as const;

  return (
    <div className="overflow-x-hidden">
      <PageHeader
        title="Diaspora support"
        description="For Ghanaians abroad and returnees: signposting to official channels for Ghana Card, passport, and nationality—plus how to join MBKRU’s citizen accountability work. The “17th Region” policy context lives in our News briefing."
      />

      <section className="section-spacing section-full border-b border-[var(--border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <DiasporaProgrammePhaseNotice />
          </div>
          <h2 className="mt-10 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
            Choose your path
          </h2>
          <p className="mt-2 max-w-3xl text-[15px] text-[var(--muted-foreground)] sm:text-base">
            Three ways diaspora supporters typically use MBKRU — pick what matches you today. All paths are non-partisan
            and evidence-led; we never replace embassies, NIA, or courts.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <Card
              href="#documentation-journeys"
              title="1. Official documentation"
              description="Ghana Card, passport, nationality: start from NIA, MFA, and GIS — verify fees and rules on .gov.gh before you pay or travel."
            />
            <Card
              href={accountabilityOn ? ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments : "/methodology"}
              title="2. Accountability from abroad"
              description={
                accountabilityOn
                  ? "Browse documented government commitments and MP-linked promises — same transparency demand as at home."
                  : "Read our methodology and phase rollout; the full public catalogue appears when this deployment enables Phase 2+ accountability data."
              }
            />
            <Card
              href="/diaspora/feedback"
              title="3. Tell us your experience"
              description="Structured feedback after a visit, or engagement from abroad only — we triage submissions to improve this hub and programmes."
            />
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            <strong className="text-[var(--foreground)]">Response times:</strong> we aim to acknowledge diaspora
            feedback within <strong className="text-[var(--foreground)]">five business days</strong> (Ghana / GMT).
            Urgent consular or immigration matters must go to your{" "}
            <strong className="text-[var(--foreground)]">embassy, high commission, or official portal</strong> — not
            only MBKRU. For how we score and cite accountability content, see the{" "}
            <Link href="/methodology" className={primaryLinkClass}>
              methodology
            </Link>{" "}
            page.
          </p>
        </div>
      </section>

      <div className="border-b border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/[0.08] via-white to-[var(--accent-gold)]/[0.12]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">Feedback — visits or abroad-only</p>
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">
              Use the form after a trip, or choose “engaging from abroad” if you have not travelled recently — both help
              us prioritise signposting and partnerships.
            </p>
          </div>
          <Link
            href="/diaspora/feedback"
            className={`${ctaClass} shrink-0 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90`}
          >
            Open feedback form
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <section className="section-spacing section-full border-b border-[var(--border)] bg-[var(--section-light-tertiary)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-lg font-bold text-[var(--foreground)]">Important</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            MBKRU <strong className="text-[var(--foreground)]">signposts and educates</strong>. We are not a government
            office, law firm, or consulate. <strong className="text-[var(--foreground)]">Fees, rules, and processing times</strong>{" "}
            are set by official institutions and can change. Always{" "}
            <strong className="text-[var(--foreground)]">verify on .gov.gh and mission websites</strong> before you pay or
            travel.
          </p>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            For policy background on the “17th Region” and the Diaspora Summit, read the{" "}
            <Link href="/news/diaspora-17th-region-2025" className={primaryLinkClass}>
              newsroom briefing
            </Link>{" "}
            (with external references). Common questions about diaspora and Voice are on the{" "}
            <Link href="/faq" className={primaryLinkClass}>
              FAQ
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="section-spacing section-full bg-gradient-to-b from-[var(--section-light)] to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="relative lg:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 sm:aspect-[16/10]">
                <Image
                  src={images.diaspora}
                  alt="Diverse group in discussion — global Ghanaian connection"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p className="font-display text-lg font-bold text-white sm:text-xl">The global Ghanaian community</p>
                  <p className="mt-1 text-sm text-white/90">
                    Ghana’s sixteen regions on the map, plus a policy “17th region” for citizens abroad—see the briefing for
                    context.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center lg:col-span-6">
              <h2 className="font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Ask MBKRU Voice on this site</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                Use the{" "}
                <strong className="text-[var(--foreground)]">MBKRU Voice</strong> control (bottom of the screen) to ask
                in plain language about this platform, accountability, and public signposting. You can attach a short text
                or PDF. When your host enables it, answers may use live web search—always double-check time-sensitive
                government rules on official sites.
              </p>
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                More input options:{" "}
                <Link href="/accessibility" className={primaryLinkClass}>
                  Accessibility &amp; voice options
                </Link>
                . Citizens at home and abroad are welcome to use the same tool. This page’s topics are also summarised
                for the assistant (site-first) when your question matches.
              </p>
              <MbkruVoiceCallout />
            </div>
          </div>
        </div>
      </section>

      <section
        id="documentation-journeys"
        className="section-spacing section-full border-y border-[var(--border)] bg-white scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-balance text-[var(--foreground)] sm:text-3xl">
            Common documentation journeys
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] text-[var(--muted-foreground)] sm:text-base">
            These are starting points, not checklists for every case. Follow the official source for your situation.
          </p>
          <div className="mt-10 space-y-10">
            {journeys.map((j) => (
              <article
                key={j.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/50 p-6 sm:p-8"
              >
                <h3 className="font-display text-xl font-bold text-[var(--foreground)]">{j.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted-foreground)]">{j.summary}</p>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-[var(--muted-foreground)] sm:text-[15px]">
                  {j.steps.map((s) => (
                    <li key={s} className="leading-relaxed">
                      {s}
                    </li>
                  ))}
                </ol>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <a
                    href={j.primary.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-semibold text-[var(--primary)] underline-offset-2 hover:underline ${focusRingSmClass}`}
                  >
                    {j.primary.label} (opens new tab)
                  </a>
                  {"secondary" in j && j.secondary ? (
                    <a
                      href={j.secondary.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-semibold text-[var(--primary)] underline-offset-2 hover:underline ${focusRingSmClass}`}
                    >
                      {j.secondary.label} (opens new tab)
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-8 text-sm text-[var(--muted-foreground)]">
            Other official hubs (verify currency):{" "}
            <a href={official.ghanaGov.href} target="_blank" rel="noopener noreferrer" className={primaryLinkClass}>
              {official.ghanaGov.label}
            </a>
            .             {legalDeskOn ? (
              <>
                For rights and signposting (not personal legal advice), see{" "}
                <Link href="/legal-empowerment" className={primaryLinkClass}>
                  Legal empowerment
                </Link>
                .
              </>
            ) : (
              <span>Legal empowerment signposting is available when this deployment enables the desk in a later phase.</span>
            )}
          </p>
        </div>
      </section>

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Collaborate on accountability</h2>
          <p className="mt-3 max-w-3xl text-[15px] text-[var(--muted-foreground)] sm:text-base">
            Diaspora skills, remittances, and networks can strengthen scrutiny of how government serves citizens—when
            channelled through non-partisan, evidence-based engagement.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {collaborate
              .filter((c) => {
                if (c.href === ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments) return accountabilityOn;
                if (c.href === "/petitions") return petitionsOn;
                return true;
              })
              .map((c) => (
                <Card key={c.href} href={c.href} title={c.label} description={c.body} className="h-full" />
              ))}
            {accountabilityOn ? null : (
              <p className="col-span-full text-sm text-[var(--muted-foreground)]">
                Government commitments and promise browsing appear when the accountability catalogue is enabled here.
              </p>
            )}
            {!petitionsOn ? (
              <p className="col-span-full text-sm text-[var(--muted-foreground)]">Petitions appear when the programme enables them on this site.</p>
            ) : null}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href="/contact" className={`${ctaClass} bg-[var(--primary)] text-white shadow-md hover:bg-[var(--primary-dark)]`}>
              Contact MBKRU
            </Link>
            <Link
              href="/news/diaspora-17th-region-2025"
              className={`${ctaClass} border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/5`}
            >
              17th Region — full briefing
            </Link>
            <Link href="/news" className={`${ctaClass} border-2 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/40`}>
              All news
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
