import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrackReportLookup } from "./TrackReportLookup";
import { primaryLinkClass, primaryNavLinkTouchClass } from "@/lib/primary-link-styles";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";

export default async function TrackReportPage() {
  if (!isCitizensVoiceEnabled()) notFound();

  return (
    <div>
      <PageHeader
        title="Track a report"
        description="Enter the tracking code you received after submitting. We show status, type, and any team notes — not your original narrative text."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16 sm:pb-20">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div
            className="mb-6 rounded-xl border border-[var(--border)] bg-white/90 px-4 py-3.5 text-xs leading-relaxed text-[var(--muted-foreground)] sm:px-5 sm:py-4"
            role="note"
          >
            <p>
              Status and team notes here are for your reference only. They do not create or prove a formal complaint to
              regulators, the Electoral Commission, or the courts — use their official channels where those apply.
            </p>
            <p className="mt-2 border-t border-[var(--border)] pt-2">
              MBKRU Voice chat is AI-assisted for navigation help only. For privacy and limitations, see{" "}
              <Link href="/privacy" className={primaryLinkClass}>
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className={primaryLinkClass}>
                Terms of Use
              </Link>
              .
            </p>
          </div>
          <TrackReportLookup />
          <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/citizens-voice/submit" className={`${primaryNavLinkTouchClass} justify-center`}>
              Submit a new report
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
