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
        description="Enter the tracking code you received after submitting. We show status, type, and any team notes — not your original narrative text."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div
            className="mb-6 rounded-xl border border-[var(--border)] bg-white/90 px-4 py-3 text-xs leading-relaxed text-[var(--muted-foreground)]"
            role="note"
          >
            Status and team notes here are for your reference only. They do not create or prove a formal complaint to
            regulators, the Electoral Commission, or the courts — use their official channels where those apply.
          </div>
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
