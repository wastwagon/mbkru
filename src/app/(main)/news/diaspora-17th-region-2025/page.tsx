import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";
import { images } from "@/lib/site-content";

const publishedLabel = "January 2026";

export const metadata: Metadata = {
  title: "Diaspora & the 17th Region — context and public reporting (briefing)",
  description:
    "Policy context for Ghana’s 17th Region framing, the 2025 Diaspora Summit, remittances, and what citizens can monitor. MBKRU civic summary — not an official communique.",
};

const sources = [
  {
    label: "Ghana Information Services Department — economic plan & 17th Region framing",
    href: "https://isd.gov.gh/ghana-declares-global-diaspora-its-17th-region-unveils-new-economic-plan/",
  },
  {
    label: "Diplomatic Times — full text, President Mahama at Diaspora Summit 2025",
    href: "https://www.diplomatictimesonline.com/full-text-speech-of-president-mahama-at-diaspora-summit-2025/",
  },
  {
    label: "Ghana News Agency — Accra Summit coverage (Dec 2025)",
    href: "https://gna.org.gh/2025/12/mahama-urges-africa-diaspora-unity-as-reparations-debate-takes-centre-stage-at-accra-summit/",
  },
];

const policyHighlights = [
  {
    title: "Policy, not only symbolism",
    body: "Public reporting describes the “17th Region” as a strategic repositioning of how the state engages Ghanaians abroad—not merely a slogan. Official communications frame diaspora communities as part of Ghana’s development architecture.",
  },
  {
    title: "Diaspora Summit 2025",
    body: "The initiative was advanced at a Diaspora Summit in Accra (19–20 December 2025), under the theme “Resetting Ghana: The Diaspora as the 17th Region,” bringing together government, missions abroad, and diaspora stakeholders.",
  },
  {
    title: "Economic weight of remittances",
    body: "Government and press reporting have highlighted that remittance inflows compare in scale to major export categories—underscoring why structured diaspora engagement matters for jobs, skills, and household welfare at home.",
  },
  {
    title: "Institutional follow-through",
    body: "Reporting on the Summit references plans for stronger diaspora institutions, clearer national policy, consular and mobility measures (including references to modernised visa pathways), and performance expectations for missions in mobilising investment and skills transfer.",
  },
];

const mbkruConnections = [
  {
    title: "Voice beyond borders",
    body: "MBKRU exists to amplify citizen voice—including Ghanaians overseas who fund families, invest, and carry ideas home. Treating diaspora as a “region” aligns with our belief that accountability must include everyone who holds a stake in Ghana’s future.",
  },
  {
    title: "Transparency on impact",
    body: "Large remittance flows deserve public conversation on how they translate into jobs, infrastructure, and services—not only consumption. Our accountability pillar supports informed debate on whether policy and spending match citizens’ expectations.",
  },
  {
    title: "Citizens’ empowerment",
    body: "Empowerment means accessible information, safe channels to speak, and institutions that respond. Diaspora inclusion, if implemented with integrity, can expand skills, capital, and scrutiny—strengthening domestic accountability rather than replacing it.",
  },
  {
    title: "National development",
    body: "Development is not top-down alone. Connecting diaspora skills, capital, and networks to local priorities—while protecting land, labour, and environment—fits MBKRU’s mission to bridge presidency and people through evidence and engagement.",
  },
];

const announcementAndActivities = {
  headline:
    "Under the banner “Resetting Ghana: The Diaspora as the 17th Region,” government and media reporting described a Diaspora Summit in Accra (19–20 December 2025) as a focal point for reframing how the state engages Ghanaians abroad.",
  activities: [
    "High-level speeches and policy framing positioning the global diaspora as integral to national renewal—not only as remittance senders but as partners in investment, skills, and ideas.",
    "Discourse on Africa–diaspora unity, historical justice, and reparations in line with wider Pan-African debates (widely reported in connection with the Summit).",
    "Emphasis on remittances and economic contribution alongside references to institutional follow-up: diaspora policy, missions’ performance, consular services, and mobility measures discussed in official and press summaries.",
    "References to heritage, culture, and tourism linkages as part of reconnecting diaspora communities with Ghana (as reported in coverage of government communications).",
  ],
  phaseNote:
    "MBKRU does not duplicate government events. We summarise public information so citizens and partners can discuss outcomes critically. Confirm dates, programmes, and figures on official portals and the references below.",
};

const mbkruSupportAndCollaboration = [
  {
    title: "Civic education & clarity",
    body: "We publish balanced explainers so Ghanaians at home and abroad understand what “17th Region” means in policy terms, what was said in public, and what questions to ask next.",
  },
  {
    title: "Accountability & transparency",
    body: "We encourage tracking of public commitments: institutions promised, timelines, remittance-linked outcomes, and service improvements for diaspora and returnees. Silence on metrics is also a signal worth scrutiny.",
  },
  {
    title: "Voice & engagement (roadmap)",
    body: "MBKRU Voice and engagement channels can help structured input—including from diaspora networks—complement town halls and media debate. Early access and feedback help us design responsibly.",
  },
  {
    title: "Collaboration pathways",
    body: "We welcome dialogue with diaspora associations, professional bodies, faith and community groups, media, and CSOs on non-partisan programmes: briefings, forums, situational awareness, and (where appropriate) joint advocacy for citizen-centred governance.",
  },
  {
    title: "Partners & supporters",
    body: "Organisations aligned with accountability and citizen empowerment can explore partnership through our Partners page and direct contact—without compromising MBKRU’s independence from party politics.",
  },
];

const brainstorm = [
  {
    q: "How can diaspora engagement stay accountable?",
    a: "Publish clear metrics: remittance-linked projects, consular turnaround times, investment facilitation outcomes, and feedback loops for diaspora communities—so promises can be tracked like any other public commitment.",
  },
  {
    q: "What should citizens monitor?",
    a: "Whether new institutions and policies improve service delivery at home, reduce exploitation of returnees, and protect workers and communities receiving investment—not only ribbon-cutting announcements.",
  },
  {
    q: "Where does MBKRU add value?",
    a: "By hosting non-partisan education, situational awareness, and structured voice—so diaspora and domestic citizens alike can demand evidence-backed governance.",
  },
  {
    q: "Who can collaborate with MBKRU on diaspora-related work?",
    a: "Groups that share our values—transparency, non-partisanship, citizen dignity—can reach out for briefings, co-hosted dialogues, or partnership enquiries. We prioritise initiatives that strengthen accountability, not partisan campaigns.",
  },
];

const ctaClass = `inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${focusRingSmClass}`;

export default function DiasporaSeventeenthRegionBriefingPage() {
  return (
    <div className="overflow-x-hidden">
      <PageHeader
        title="Diaspora & the 17th Region — public context (briefing)"
        description="A civic summary of reported policy framing, Summit themes, and accountability questions. For practical help with passports and Ghana Card, use the diaspora support hub; this page is the newsroom-style backgrounder."
        breadcrumbCurrentLabel="Diaspora & 17th Region (briefing)"
      />

      <p className="border-b border-[var(--border)] bg-[var(--section-light-tertiary)] px-4 py-2 text-center text-xs text-[var(--muted-foreground)] sm:px-6">
        <span className="font-medium text-[var(--foreground)]">Last compiled for the site: {publishedLabel}.</span>{" "}
        Re-verify facts on official sites as policies and dates change.{" "}
        <Link href="/diaspora" className={primaryLinkClass}>
          Diaspora support hub
        </Link>
        .
      </p>

      <section className="section-spacing section-full bg-gradient-to-b from-[var(--section-light)] to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="relative lg:col-span-7">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 sm:aspect-[16/10] lg:aspect-auto lg:min-h-[280px]">
                <Image
                  src={images.diaspora}
                  alt="Diverse group in discussion — global Ghanaian connection and dialogue"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
                  aria-hidden
                />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                  <p className="font-display text-lg font-bold text-white drop-shadow-sm sm:text-xl">Global citizens. One nation.</p>
                  <p className="mt-1 max-w-md text-sm text-white/90">
                    Policy that recognises the diaspora strengthens accountability at home and abroad.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center lg:col-span-5">
              <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
                <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                  Civic backgrounder
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-balance text-[var(--foreground)] sm:text-2xl">
                  Sixteen regions on the map — plus a policy “region” abroad
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                  Ghana has{" "}
                  <strong className="font-semibold text-[var(--foreground)]">sixteen administrative regions</strong>.
                  The phrase <strong className="font-semibold text-[var(--foreground)]">“17th Region”</strong> names
                  the <strong className="font-semibold text-[var(--foreground)]">global Ghanaian diaspora</strong> as a
                  policy constituency. This page draws on{" "}
                  <strong className="font-semibold text-[var(--foreground)]">public reporting</strong> around the 2025
                  Diaspora Summit; verify details on primary sources as policies evolve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing section-full border-y border-[var(--border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <h2 className="font-display text-2xl font-bold text-balance text-[var(--foreground)] sm:text-3xl">
                The announcement &amp; reported Summit activities
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                {announcementAndActivities.headline}
              </p>
              <h3 className="mt-10 font-display text-lg font-semibold text-[var(--foreground)]">
                Themes and activities in public reporting
              </h3>
              <ul className="mt-4 space-y-4 text-[15px] text-[var(--muted-foreground)] sm:text-base">
                {announcementAndActivities.activities.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-gold)]" aria-hidden />
                    <span className="leading-relaxed">{line}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {announcementAndActivities.phaseNote}
              </p>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 lg:sticky lg:top-24">
                <Image
                  src={images.diasporaSummit}
                  alt="Community gathering — symbolic of Summit-style dialogue and engagement"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/20 to-transparent" aria-hidden />
              </div>
              <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
                Imagery is illustrative; see official sources for event photography.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-balance text-[var(--foreground)] sm:text-3xl">Policy highlights (public record)</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              Summaries reflect widely reported themes from the Summit and related communications. Figures and programmes
              may change—use the references at the end of this page.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {policyHighlights.map((item) => (
              <Card key={item.title} title={item.title} description={item.body} className="h-full" />
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">How MBKRU relates to this conversation</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mbkruSupportAndCollaboration.map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/40 p-6"
              >
                <h3 className="font-display text-base font-semibold text-[var(--foreground)] sm:text-lg">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-[15px]">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Link href="/partners" className={`${ctaClass} border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/5`}>
              Partners &amp; supporters
            </Link>
            <Link href="/contact" className={`${ctaClass} bg-[var(--primary)] text-white shadow-md hover:bg-[var(--primary-dark)]`}>
              Propose a collaboration
            </Link>
            <Link href="/diaspora" className={`${ctaClass} border-2 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/40`}>
              Practical diaspora support hub
            </Link>
          </div>
        </div>
      </section>

      <section className="section-spacing section-full border-y border-[var(--border)] bg-gradient-to-b from-white via-[var(--section-light)]/40 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="relative aspect-[16/11] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 lg:aspect-[4/3]">
              <Image
                src={images.partnership}
                alt="Collaboration and partnership"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Why this matters to MBKRU</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                MBKRU Advocates is <strong className="text-[var(--foreground)]">non-partisan</strong>. We care whether
                public narratives translate into{" "}
                <strong className="text-[var(--foreground)]">measurable inclusion, transparency, and citizen power</strong>
                .
              </p>
              <div className="mt-8 space-y-5">
                {mbkruConnections.map((item) => (
                  <div key={item.title} className="border-l-4 border-[var(--accent-gold)] bg-[var(--section-light)]/80 py-4 pl-5 pr-4">
                    <h3 className="font-semibold text-[var(--foreground)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-[15px]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing section-full relative bg-[var(--section-dark)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Questions for citizens &amp; diaspora</h2>
          <p className="mt-3 max-w-2xl text-[15px] text-white/85 sm:text-base">Grounding emotion in evidence in community and media.</p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {brainstorm.map((item) => (
              <li key={item.q} className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6">
                <p className="font-display text-sm font-semibold text-[var(--accent-gold)] sm:text-base">{item.q}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-[15px]">{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-spacing section-full bg-gradient-to-b from-[var(--section-light)] to-white pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl">References (external)</h2>
          <ul className="mt-6 space-y-4">
            {sources.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-start gap-3 text-sm font-medium text-[var(--primary)] underline-offset-4 sm:text-[15px] ${focusRingSmClass}`}
                >
                  <span className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </span>
                  <span className="leading-snug group-hover:underline">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-[var(--muted-foreground)]">
            Citations for datasets across the site are on{" "}
            <Link href="/data-sources" className={primaryLinkClass}>
              Data sources
            </Link>
            . Imagery is curated for readability, not an official event record.
          </p>
        </div>
      </section>
    </div>
  );
}
