import type { Metadata } from "next";
import Link from "next/link";
import { DiasporaFeedbackForm } from "@/components/forms/DiasporaFeedbackForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export const metadata: Metadata = {
  title: "Diaspora experience & feedback",
  description:
    "Share your visit experience in Ghana with MBKRU — structured feedback for programme records and follow-up.",
  alternates: {
    canonical: "/diaspora/feedback",
  },
};

export default function DiasporaFeedbackPage() {
  return (
    <div>
      <PageHeader
        title="Diaspora experience & feedback"
        description="Tell us about your visit, programmes you joined, and how we can strengthen diaspora engagement. Your email is used for follow-up; submissions are stored in the MBKRU admin for programme records."
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[var(--muted-foreground)]">
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
