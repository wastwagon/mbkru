import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrackReportLookup } from "./TrackReportLookup";
import { focusRingSmClass, primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";

export default async function TrackReportPage() {
  if (!isCitizensVoiceEnabled()) notFound();

  return (
    <div>
      <PageHeader
        title="Track a report"
        description="Members only: sign in, then enter the tracking code from your submission. We show status, type, and any team notes — not your original narrative text."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16 sm:pb-20">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <p className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
            Your tracking code is your citizen receipt — save it when you submit. Status updates here are for reference
            only, not a formal regulator filing.{" "}
            <Link href="/methodology" className={primaryNavLinkClass}>
              Methodology
            </Link>
          </p>
          <div
            className="mt-4 rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 text-xs leading-relaxed text-[var(--foreground-secondary)] sm:px-5 sm:py-4"
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
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
            <TrackReportLookup />
          </div>
          <p className="mt-8 text-center text-sm text-[var(--foreground-secondary)]">
            <Link
              href="/citizens-voice/submit"
              className={`inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] ${focusRingSmClass}`}
            >
              Submit a new report
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
