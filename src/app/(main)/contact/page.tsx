import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { content } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with My Brother's Keeper Restoration United (MBKRU). Contact form and enquiries.",
};

const infoBlocks = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    heading: "Office Address",
    content: `My Brother's Keeper Restoration United — ${content.address}. ${content.officeDetails}`,
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    heading: "Email & Phone",
    content: content.contactDetails,
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16a6 6 0 01-14 0m9 0a6 6 0 00-7-7" />
      </svg>
    ),
    heading: "Press & Media Enquiries",
    content: "Use the contact form above for press and media enquiries. We aim to respond within two business days.",
  },
];

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        title="Contact Us"
        description="Reach the MBKRU team for partnerships, press, general enquiries, or feedback on this site. We read every message and aim to reply within two business days."
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
              <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">
                Send a Message
              </h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                We aim to respond within two business days. For urgent safety matters, contact the police or emergency services first.
              </p>
              <ContactForm />
            </div>
            <div className="space-y-6">
              {infoBlocks.map((block) => (
                <div
                  key={block.heading}
                  className="flex gap-4 rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/15 to-[var(--accent)]/10 text-[var(--primary)]">
                    {block.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">
                      {block.heading}
                    </h3>
                    <p className="mt-2 text-[var(--muted-foreground)]">
                      {block.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
