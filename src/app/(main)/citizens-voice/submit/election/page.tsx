import Link from "next/link";
import { notFound } from "next/navigation";

import { VoiceReportForm } from "@/components/forms/VoiceReportForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
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
        description="This intake is for election-window situational observations. Reports are moderated and are not filings with the EC or courts. You will receive a tracking code."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/election-observation" className="text-[var(--primary)] hover:underline">
              Election hub
            </Link>
            {" · "}
            <Link href="/citizens-voice/submit" className="text-[var(--primary)] hover:underline">
              General submit
            </Link>
            {" · "}
            <Link href="/track-report" className="text-[var(--primary)] hover:underline">
              Track a report
            </Link>
          </p>
          <VoiceReportForm regions={regions} defaultKind="ELECTION_OBSERVATION" lockKind />
        </div>
      </section>
    </div>
  );
}
