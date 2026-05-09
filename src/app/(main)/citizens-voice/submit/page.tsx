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

  return (
    <div>
      <PageHeader
        title="Submit a report"
        description="Secure intake for MBKRU Voice and related channels. You will receive a tracking code — save it to check status later. We moderate all submissions. Election observation reports include extra review and are not filings with the EC or courts."
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
          <VoiceReportForm regions={regions} />
        </div>
      </section>
    </div>
  );
}
