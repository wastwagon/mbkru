import Link from "next/link";

import { primaryNavLinkClass } from "@/lib/primary-link-styles";

const inspirationLinks = [
  { label: "Grading Congress — Legislative Performance Index", href: "https://gradingcongress.com/methodology" },
  { label: "Change.org — People-Power Index (UK)", href: "https://www.change.org/l/uk/the-people-power-index-methodology" },
  { label: "Scorecard Nigeria", href: "https://scorecardnigeria.com/" },
  {
    label: "IPU — Responding to public concerns (indicator 4.1.1)",
    href: "https://www.parliamentaryindicators.org/indicators/responsive/valuing-public-concerns/responding-public-concerns",
  },
  { label: "Open Government Partnership — IRM overview", href: "https://www.opengovpartnership.org/irm-guidance-overview/" },
  { label: "Parliament of Ghana — Hansard", href: "https://www.parliament.gh/docs?type=HS" },
] as const;

/** Published Ghana v1 methodology — aligned with MBKRU editorial and data practice. */
export function MethodologyGhanaReportCardSection() {
  return (
    <div className="mt-12 border-t border-[var(--border)] pt-10">
      <h2 className="font-display text-xl font-bold text-[var(--foreground)]">
        People&apos;s Report Card — Ghana methodology (v1)
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
        MBKRU does not copy a single foreign scorecard wholesale. We combine international transparency practice with{" "}
        <strong className="text-[var(--foreground)]">Ghanaian institutions</strong> (Parliament, Hansard, constitutional
        attendance debate, constituency project transparency) and our own{" "}
        <strong className="text-[var(--foreground)]">editorial governance</strong>. Headline scores are published only as
        editorial products with cited sources — not as Electoral Commission or court findings.
      </p>

      <h3 className="mt-8 font-display text-lg font-semibold text-[var(--foreground)]">Evidence ladder</h3>
      <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[var(--muted-foreground)]">
        <li>
          <strong className="text-[var(--foreground)]">Tier A — Official / primary:</strong> Parliament materials,
          cited manifesto excerpts, gazettes, authoritative .gov.gh instructions.
        </li>
        <li>
          <strong className="text-[var(--foreground)]">Tier B — Secondary:</strong> CHRAJ, Auditor-General, reputable
          monitors — always labelled and linked.
        </li>
        <li>
          <strong className="text-[var(--foreground)]">Tier C — Citizen experience:</strong> structured MBKRU Voice and
          related submissions; <strong className="text-[var(--foreground)]">reported experience</strong>, not
          adjudicated fact. We use <strong className="text-[var(--foreground)]">medians and caps</strong> in aggregation
          so coordinated pile-ons cannot dominate the citizen-experience layer.
        </li>
      </ul>

      <h3 className="mt-8 font-display text-lg font-semibold text-[var(--foreground)]">MP index — three components</h3>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
        Each component is scored and published with its own formula and limitations. A headline combines them with{" "}
        <strong className="text-[var(--foreground)]">fixed weights</strong> (reviewed annually, not changed mid-cycle).
      </p>
      <ol className="mt-4 list-inside list-decimal space-y-3 text-sm text-[var(--muted-foreground)]">
        <li>
          <strong className="text-[var(--foreground)]">Legislative duty (0–100)</strong> — plenary and voting presence
          (with fair exclusions for Speaker, deputies, documented leave); legislative initiative (bills, motions,
          questions where records allow); committee and oversight work; integrity sub-score uses{" "}
          <strong className="text-[var(--foreground)]">proven findings only</strong> (no points from raw allegations).
        </li>
        <li>
          <strong className="text-[var(--foreground)]">Constituency accountable representation (0–50)</strong> —
          availability (office, surgeries, casework paths); voice for the constituency in Hansard-style records;
          Ghana-specific <strong className="text-[var(--foreground)]">constituency project transparency</strong>{" "}
          (documented public accounting, not rumour).
        </li>
        <li>
          <strong className="text-[var(--foreground)]">Citizen-verified experience (0–30)</strong> — triaged structured
          reports (verified / partially supported / not used for scoring), aligned with democratic-parliament norms on
          raising concerns, processing input, and feedback loops.
        </li>
      </ol>
      <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--section-light)]/60 px-4 py-3 text-sm text-[var(--foreground)]">
        <strong className="font-semibold">Headline (v1 weights):</strong>{" "}
        <span className="font-mono text-[13px]">0.50 × Legislative + 0.35 × Constituency + 0.15 × Citizen experience</span>
      </p>

      <h3 className="mt-8 font-display text-lg font-semibold text-[var(--foreground)]">Government performance (parallel)</h3>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
        Programme and manifesto commitments use a commitment lifecycle (not started → in progress → substantially
        complete → complete / blocked) with evidence packs — similar in spirit to open-government commitment tracking.
        Citizen reports can illustrate delivery problems but <strong className="text-[var(--foreground)]">do not alone</strong>{" "}
        flip a commitment to “fulfilled.”
      </p>

      <h3 className="mt-8 font-display text-lg font-semibold text-[var(--foreground)]">Publication governance</h3>
      <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[var(--muted-foreground)]">
        <li>Fixed publication cycles and dataset freeze dates.</li>
        <li>
          <strong className="text-[var(--foreground)]">Pre-publication factual dispute window</strong> for Tier A
          errors (wrong attribution, wrong attendance row); no veto over honest citizen experience summaries except
          factual mis-identification (wrong MP or constituency).
        </li>
        <li>Published limitations: selection bias, digital divide, coordinated campaigns.</li>
      </ul>

      <h3 className="mt-8 font-display text-lg font-semibold text-[var(--foreground)]">International references we adapted</h3>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        We drew structure and fairness ideas from the following; Ghana data availability and MBKRU editorial sign-off
        determine what is live in each cycle:
      </p>
      <ul className="mt-3 list-inside list-disc space-y-2 text-sm">
        {inspirationLinks.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className={primaryNavLinkClass}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-[var(--muted-foreground)]">
        For diaspora-facing signposting and how accountability tools roll out by phase, see{" "}
        <Link href="/diaspora" className={primaryNavLinkClass}>
          Diaspora support
        </Link>
        .
      </p>
    </div>
  );
}
