import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";
import { faqContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Common questions about MBKRU — membership, complaints, political affiliation, People's Report Card, funding, and platform launch.",
};

export default function FAQPage() {
  return (
    <div>
      <PageHeader
        title="Frequently Asked Questions"
        description="Common questions about MBKRU, our platform, and how you can get involved."
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-6">
            {faqContent.map((item, i) => (
              <details
                key={i}
                className="group rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 open:border-[var(--primary)]/20 open:shadow-[var(--shadow-card-hover)]"
              >
                <summary
                  className={`flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg py-1 font-display text-lg font-semibold text-[var(--foreground)] [&::-webkit-details-marker]:hidden ${focusRingSmClass}`}
                >
                  {item.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] transition-transform group-open:rotate-180">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 border-t border-[var(--border)] pt-4 text-[var(--muted-foreground)] leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
            Have another question?{" "}
            <Link href="/contact" className={primaryLinkClass}>
              Get in touch
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
