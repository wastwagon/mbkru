import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { isWhistleblowerGuidancePageEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Whistleblowing & safe reporting",
  description:
    "How MBKRU Voice fits alongside formal whistleblower channels — practical guidance for people considering reporting wrongdoing in Ghana.",
};

export default function WhistleblowingPage() {
  if (!isWhistleblowerGuidancePageEnabled()) notFound();

  return (
    <div>
      <PageHeader
        title="Whistleblowing & safe reporting"
        description="MBKRU documents public-interest concerns with care for privacy and security. This page explains how Voice relates to whistleblowing — not legal advice."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">MBKRU Voice</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Use{" "}
              <Link href="/citizens-voice" className={primaryLinkClass}>
                MBKRU Voice
              </Link>{" "}
              to submit situational reports, service failures, and wrongdoing tips with optional follow-up. You can track some
              submissions with a code where enabled. We triage for verification and public accountability — we are not a law
              firm or a government hotline.
            </p>
            <h2 className="mt-8 text-lg font-semibold text-[var(--foreground)]">Formal whistleblower protections</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Statutory whistleblower regimes, employer policies, and regulator channels may offer protections or escalation
              paths MBKRU cannot provide. Consider documenting facts, dates, and evidence carefully, and seek independent legal
              advice where serious personal or career risks apply.
            </p>
            <h2 className="mt-8 text-lg font-semibold text-[var(--foreground)]">Communities</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Local and traditional-area{" "}
              <Link href="/communities" className={primaryLinkClass}>
                communities
              </Link>{" "}
              on MBKRU can surface concerns collectively; they complement but do not replace confidential reporting channels
              where those exist.
            </p>
            <p className="mt-8 text-sm text-[var(--muted-foreground)]">
              For how we describe evidence, promises, and score-style outputs on the public site, see{" "}
              <Link href="/methodology#claims-and-citations" className={primaryLinkClass}>
                Accountability methodology — claims &amp; citations
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
