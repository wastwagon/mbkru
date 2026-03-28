import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrackReportLookup } from "./TrackReportLookup";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";

export default async function TrackReportPage() {
  if (!isCitizensVoiceEnabled()) notFound();

  return (
    <div>
      <PageHeader
        title="Track a report"
        description="Enter the tracking code you received after submitting. We only show status and type — not your narrative."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <TrackReportLookup />
          <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/citizens-voice/submit" className="text-[var(--primary)] hover:underline">
              Submit a new report
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
