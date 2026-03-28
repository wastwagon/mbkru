import Link from "next/link";
import { notFound } from "next/navigation";
import { VoiceReportForm } from "@/components/forms/VoiceReportForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isSituationalAlertsIntakeEnabled } from "@/lib/reports/situational-alerts-gate";

export const dynamic = "force-dynamic";

export default async function SubmitSituationalAlertPage() {
  if (!isSituationalAlertsIntakeEnabled()) notFound();
  if (!isDatabaseConfigured()) notFound();

  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div>
      <PageHeader
        title="Submit a situational alert"
        description="Report time-sensitive local situations (safety, public order, infrastructure) for staff triage. You receive a tracking code; we moderate every submission and may verify before any wider use."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/situational-alerts" className="text-[var(--primary)] hover:underline">
              ← Physical Engagement Network
            </Link>
            {" · "}
            <Link href="/track-report" className="text-[var(--primary)] hover:underline">
              Track a report
            </Link>
            {" · "}
            <Link href="/citizens-voice/submit" className="text-[var(--primary)] hover:underline">
              MBKRU Voice (general reports)
            </Link>
          </p>
          <VoiceReportForm
            regions={regions}
            defaultKind="SITUATIONAL_ALERT"
            lockKind
            bodyPlaceholder="State what you observed, when, and where (landmark or coordinates if safe to share). Avoid naming unverified individuals; stick to observable facts."
          />
        </div>
      </section>
    </div>
  );
}
