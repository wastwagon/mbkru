import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { isLegalEmpowermentPageEnabled } from "@/lib/reports/accountability-pages";

/** Respect server `PLATFORM_PHASE` without requiring a rebuild for gating. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Legal empowerment desk",
  description:
    "How MBKRU signposts legal information and official accountability channels in Ghana — not a law firm or substitute for CHRAJ, the courts, or regulators.",
};

export default function LegalEmpowermentPage() {
  if (!isLegalEmpowermentPageEnabled()) notFound();

  return (
    <div>
      <PageHeader
        title="Legal empowerment desk"
        description="Plain-language signposting to official channels. MBKRU does not provide individual legal representation or formal complaints handling on behalf of regulators."
        breadcrumbCurrentLabel="Legal desk"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-[var(--muted-foreground)] sm:px-6 lg:px-8">
          <p>
            This desk is a <strong className="text-[var(--foreground)]">navigation layer</strong>: we help citizens
            understand where different kinds of grievances usually belong — for example{" "}
            <strong className="text-[var(--foreground)]">CHRAJ</strong> for administrative injustice, sector regulators
            for some service failures, and the <strong className="text-[var(--foreground)]">courts</strong> where legal
            process applies. We will expand curated guides and FAQs as the programme matures.
          </p>
          <p>
            Use <Link href="/citizens-voice/submit" className="font-medium text-[var(--primary)] hover:underline">MBKRU Voice</Link>{" "}
            to document issues for our accountability work; it is <strong className="text-[var(--foreground)]">not</strong> a
            filing with CHRAJ, the EC, or the judiciary.
          </p>
          <p>
            <Link href="/contact" className="font-medium text-[var(--primary)] hover:underline">
              Contact us
            </Link>{" "}
            for partnerships or to suggest resources we should list for your community.
          </p>
        </div>
      </section>
    </div>
  );
}
