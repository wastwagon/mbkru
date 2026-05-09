import Link from "next/link";
import { notFound } from "next/navigation";

import { VoiceReportForm } from "@/components/forms/VoiceReportForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";

export const dynamic = "force-dynamic";

export default async function SubmitElectionObservationPage() {
  if (!isCitizensVoiceEnabled() || !isDatabaseConfigured()) notFound();
  if (!platformFeatures.electionObservatory(getServerPlatformPhase())) notFound();

  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div>
      <PageHeader
        title="Election observation report"
        description="This form is for election-window situational observations. Reports are moderated and are not filings with the EC or courts. You will receive a tracking code."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-[var(--muted-foreground)]">
            <Link
              href="/election-observation"
              className={primaryNavLinkClass}
            >
              Election hub
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link
              href="/citizens-voice/submit"
              className={primaryNavLinkClass}
            >
              General submit
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link
              href="/track-report"
              className={primaryNavLinkClass}
            >
              Track a report
            </Link>
          </p>
          <VoiceReportForm regions={regions} defaultKind="ELECTION_OBSERVATION" lockKind />
        </div>
      </section>
    </div>
  );
}
