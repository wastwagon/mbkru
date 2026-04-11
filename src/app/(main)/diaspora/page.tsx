import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { images } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "The Diaspora as Ghana’s 17th Region",
  description:
    "Summit context, reported activities, and how MBKRU supports diaspora-related civic education, accountability, and collaboration in Phase 1.",
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

const supportIcons = [
  (k: string) => (
    <svg key={k} className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  (k: string) => (
    <svg key={k} className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  (k: string) => (
    <svg key={k} className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  (k: string) => (
    <svg key={k} className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  (k: string) => (
    <svg key={k} className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
];

const mbkruSupportAndCollaboration = [
  {
    title: "Civic education & clarity",
    body: "We publish balanced explainers—like this page—so Ghanaians at home and abroad understand what “17th Region” means in policy terms, what was said in public, and what questions to ask next.",
  },
  {
    title: "Accountability & transparency",
    body: "We encourage tracking of public commitments: institutions promised, timelines, remittance-linked outcomes, and service improvements for diaspora and returnees. Silence on metrics is also a signal worth scrutiny.",
  },
  {
    title: "Voice & engagement (roadmap)",
    body: "Phase 1 prepares MBKRU Voice and engagement channels so that, when launched, structured input—including from diaspora networks—can complement town halls and media debate. Early access sign-ups help us design responsibly.",
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
    a: "By hosting non-partisan education, situational awareness, and (in later phases) structured voice—so diaspora and domestic citizens alike can demand evidence-backed governance.",
  },
  {
    q: "Who can collaborate with MBKRU on diaspora-related work?",
    a: "Groups that share our values—transparency, non-partisanship, citizen dignity—can reach out for briefings, co-hosted dialogues, or partnership enquiries. We prioritise initiatives that strengthen accountability, not partisan campaigns.",
  },
];

const ctaClass =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

export default function DiasporaPage() {
  return (
    <div className="overflow-x-hidden">
      <PageHeader
        title="The Diaspora as Ghana’s 17th Region"
        description="Announcement context, reported Summit activities, and how MBKRU supports civic education, accountability, and collaboration in Phase 1."
      />

      <div className="border-b border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/[0.08] via-white to-[var(--accent-gold)]/[0.12]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">Visiting Ghana?</p>
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted-foreground)]">
              Share your experience in our structured feedback form — responses are saved to the MBKRU admin for
              programme records.
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

      {/* Hero: mobile-first — image stacks above copy; premium card + imagery */}
      <section className="section-spacing section-full bg-gradient-to-b from-[var(--section-light)] to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="relative lg:col-span-7">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 sm:aspect-[16/10] lg:aspect-auto lg:min-h-[320px]">
                <Image
                  src={images.diaspora}
                  alt="Diverse group in discussion — representing global Ghanaian connection and dialogue"
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
                  <p className="font-display text-lg font-bold text-white drop-shadow-sm sm:text-xl">
                    Global citizens. One nation.
                  </p>
                  <p className="mt-1 max-w-md text-sm text-white/90">
                    Policy that recognises the diaspora strengthens accountability at home and abroad.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center lg:col-span-5">
              <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
                <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                  Phase 1 · Civic context
                </span>
                <h2 className="mt-4 font-display text-xl font-bold text-balance text-[var(--foreground)] sm:text-2xl">
                  Sixteen regions on the map — plus a policy “region” abroad
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                  Ghana has{" "}
                  <strong className="font-semibold text-[var(--foreground)]">sixteen administrative regions</strong>.
                  The phrase{" "}
                  <strong className="font-semibold text-[var(--foreground)]">“17th Region”</strong> names the{" "}
                  <strong className="font-semibold text-[var(--foreground)]">global Ghanaian diaspora</strong> as a
                  policy constituency. Content on this page draws on{" "}
                  <strong className="font-semibold text-[var(--foreground)]">public reporting</strong> around the 2025
                  Diaspora Summit; verify details on primary sources as policies evolve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcement & activities — image + list for scanability */}
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
                    <span
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-gold)]"
                      aria-hidden
                    />
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

      {/* Policy cards */}
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center lg:mx-auto lg:max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-balance text-[var(--foreground)] sm:text-3xl">
              Policy highlights (public record)
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              Summaries reflect widely reported themes from the Summit and related communications.
              Figures and programmes may change—use the references below.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {policyHighlights.map((item) => (
              <Card key={item.title} title={item.title} description={item.body} className="h-full" />
            ))}
          </div>
        </div>
      </section>

      {/* MBKRU support — icon cards, mobile-first grid */}
      <section className="section-spacing section-full bg-gradient-to-b from-white via-[var(--section-light)]/40 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-balance text-[var(--foreground)] sm:text-3xl">
              How MBKRU can support, assist &amp; collaborate
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
              Phase 1 is our civic platform—not a government programme. Here is what we offer and how we invite
              collaboration, without blurring non-partisan boundaries.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mbkruSupportAndCollaboration.map((item, i) => (
              <div
                key={item.title}
                className="group flex flex-col rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] transition duration-300 hover:border-[var(--primary)]/25 hover:shadow-[var(--shadow-card-hover)] sm:p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/15 to-[var(--accent)]/10 text-[var(--primary)] transition group-hover:from-[var(--primary)]/20">
                  {supportIcons[i]?.(`icon-${i}`)}
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-[var(--foreground)] sm:text-lg">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-[15px]">
                  {item.body}
                </p>
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
          </div>
        </div>
      </section>

      {/* Why MBKRU — split with imagery */}
      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="relative aspect-[16/11] overflow-hidden rounded-2xl shadow-[var(--shadow-card)] ring-1 ring-black/5 lg:aspect-[4/3]">
              <Image
                src={images.partnership}
                alt="Collaboration and partnership — aligned with MBKRU’s mission"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-balance text-[var(--foreground)] sm:text-3xl">
                Why this matters to MBKRU
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-base">
                MBKRU Advocates is <strong className="text-[var(--foreground)]">non-partisan</strong>: we do not campaign
                for parties. We care whether public narratives translate into{" "}
                <strong className="text-[var(--foreground)]">measurable inclusion, transparency, and citizen power</strong>.
              </p>
              <div className="mt-8 space-y-5">
                {mbkruConnections.map((item) => (
                  <div
                    key={item.title}
                    className="border-l-4 border-[var(--accent-gold)] bg-[var(--section-light)]/80 py-4 pl-5 pr-4"
                  >
                    <h3 className="font-semibold text-[var(--foreground)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-[15px]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brainstorm — premium dark band */}
      <section className="section-spacing section-full relative bg-[var(--section-dark)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-balance sm:text-3xl">
            Questions for citizens &amp; diaspora
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] text-white/85 sm:text-base">
            Use these prompts in community discussions, town halls, and media—grounding emotion in evidence.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {brainstorm.map((item) => (
              <li
                key={item.q}
                className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 backdrop-blur-sm sm:p-6"
              >
                <p className="font-display text-sm font-semibold text-[var(--accent-gold)] sm:text-base">{item.q}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-[15px]">{item.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* References + CTA */}
      <section className="section-spacing section-full bg-gradient-to-b from-[var(--section-light)] to-white pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
            <div className="grid lg:grid-cols-5">
              <div className="relative hidden min-h-[200px] lg:block lg:col-span-2">
                <Image
                  src={images.accountability}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40vw"
                />
                <div className="absolute inset-0 bg-[var(--primary)]/35" aria-hidden />
                <div className="relative flex h-full flex-col justify-end p-8">
                  <p className="font-display text-lg font-bold text-white">Sources &amp; next steps</p>
                  <p className="mt-2 text-sm text-white/90">
                    Verify facts on official portals. MBKRU is here for civic dialogue—not partisan spin.
                  </p>
                </div>
              </div>
              <div className="p-6 sm:p-8 lg:col-span-3">
                <h2 className="font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl">
                  References (external)
                </h2>
                <ul className="mt-6 space-y-4">
                  {sources.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 text-sm text-[var(--primary)] sm:text-[15px]"
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
                        <span className="leading-snug underline-offset-4 group-hover:underline">{s.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-8 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/citizens-voice"
                    className={`${ctaClass} bg-[var(--primary)] text-white shadow-md hover:bg-[var(--primary-dark)]`}
                  >
                    MBKRU Voice — early access
                  </Link>
                  <Link
                    href="/partners"
                    className={`${ctaClass} border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/5`}
                  >
                    Partners
                  </Link>
                  <Link
                    href="/contact"
                    className={`${ctaClass} border-2 border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/40`}
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            </div>
            <div className="border-t border-[var(--border)] bg-[var(--section-light)]/50 px-6 py-4 lg:hidden">
              <p className="text-center text-xs text-[var(--muted-foreground)]">
                Imagery on this page is curated stock-style photography for readability; it does not depict official MBKRU events. Public data citations are on{" "}
                <Link href="/data-sources" className="font-medium text-[var(--primary)] underline">
                  Data sources
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
