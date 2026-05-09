import Link from "next/link";
import { notFound } from "next/navigation";
import { VoiceReportForm } from "@/components/forms/VoiceReportForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
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
          <p className="mb-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-[var(--muted-foreground)]">
            <Link
              href="/situational-alerts"
              className={primaryNavLinkClass}
            >
              ← Physical Engagement Network
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
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link
              href="/citizens-voice/submit"
              className={primaryNavLinkClass}
            >
              MBKRU Voice (general reports)
            </Link>
          </p>
          <VoiceReportForm
            regions={regions}
            defaultKind="SITUATIONAL_ALERT"
            lockKind
            bodyPlaceholder="State what you observed, when, and where (landmark or general area — use Local area below, not a full street address). Avoid naming unverified individuals; stick to observable facts."
          />
        </div>
      </section>
    </div>
  );
}
