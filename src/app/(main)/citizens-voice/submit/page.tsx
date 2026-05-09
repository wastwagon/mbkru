import Link from "next/link";
import { notFound } from "next/navigation";
import { VoiceReportForm } from "@/components/forms/VoiceReportForm";

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/ui/PageHeader";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";

export default async function SubmitVoiceReportPage() {
  if (!isCitizensVoiceEnabled()) notFound();
  if (!isDatabaseConfigured()) notFound();

  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const mpRows = await prisma.parliamentMember.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      party: true,
      constituency: { select: { name: true } },
    },
  });
  const mpOptions = mpRows.map((m) => ({
    id: m.id,
    label: `${m.name}${m.party ? ` · ${m.party}` : ""}${m.constituency?.name ? ` · ${m.constituency.name}` : ""}`,
  }));

  return (
    <div>
      <PageHeader
        title="Submit a report"
        description="Choose report type — general Voice, MP performance, government performance, situational alerts, or election observation (when enabled). You submit directly; staff moderate and triage. You get a tracking code to check status. Not a court filing or official agency petition unless you also use those channels."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-[var(--muted-foreground)]">
            <Link
              href="/citizens-voice"
              className={primaryNavLinkClass}
            >
              ← Back to MBKRU Voice
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link
              href="/track-report"
              className={primaryNavLinkClass}
            >
              Track an existing report
            </Link>
          </p>
          <VoiceReportForm regions={regions} mpOptions={mpOptions} />
        </div>
      </section>
    </div>
  );
}
