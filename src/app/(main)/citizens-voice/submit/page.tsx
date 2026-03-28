import Link from "next/link";
import { notFound } from "next/navigation";
import { VoiceReportForm } from "@/components/forms/VoiceReportForm";

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/ui/PageHeader";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";

export default async function SubmitVoiceReportPage() {
  if (!isCitizensVoiceEnabled()) notFound();
  if (!isDatabaseConfigured()) notFound();

  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        title="Submit a report"
        description="Pilot intake for MBKRU Voice and related channels. You will receive a tracking code — save it to check status later. We moderate all submissions."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/citizens-voice" className="text-[var(--primary)] hover:underline">
              ← Back to MBKRU Voice
            </Link>
            {" · "}
            <Link href="/track-report" className="text-[var(--primary)] hover:underline">
              Track an existing report
            </Link>
          </p>
          <VoiceReportForm regions={regions} />
        </div>
      </section>
    </div>
  );
}
