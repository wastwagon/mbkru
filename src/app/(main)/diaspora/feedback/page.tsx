import type { Metadata } from "next";
import Link from "next/link";
import { DiasporaProgrammePhaseNotice } from "@/components/diaspora/DiasporaProgrammePhaseNotice";
import { DiasporaFeedbackForm } from "@/components/forms/DiasporaFeedbackForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export const metadata: Metadata = {
  title: "Diaspora experience & feedback",
  description:
    "Share structured diaspora feedback with MBKRU — after a visit to Ghana or engaging from abroad — for programme records and hub improvements.",
  alternates: {
    canonical: "/diaspora/feedback",
  },
};

export default function DiasporaFeedbackPage() {
  return (
    <div>
      <PageHeader
        title="Diaspora experience & feedback"
        description="Tell us about a recent visit, or choose “engaging from abroad” if you have not travelled to Ghana lately — both paths use the same secure form. Your email is used for follow-up; submissions are stored for programme records."
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <DiasporaProgrammePhaseNotice />

          <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            Prefer context first?{" "}
            <Link href="/diaspora" className={primaryLinkClass}>
              Back to diaspora support hub
            </Link>{" "}
            ·{" "}
            <Link href="/news/diaspora-17th-region-2025" className={primaryLinkClass}>
              17th Region policy briefing
            </Link>
            .
          </p>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-10">
            <DiasporaFeedbackForm />
          </div>
        </div>
      </section>
    </div>
  );
}
