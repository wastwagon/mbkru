import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { images, resourcesConceptNote } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Reports, policy briefs, and research documents from MBKRU.",
};

const documentCategories = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Reports",
    description: "Annual reports, People's Report Cards, and accountability assessments.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Policy Briefs",
    description: "Evidence-based policy recommendations for governance and poverty eradication.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: "Research",
    description: "Studies on citizen engagement, reparations, and sustainable development.",
  },
];

export default function ResourcesPage() {
  return (
    <div>
      <PageHeader
        title="Resources"
        description="Reports, policy briefs, and research documents from MBKRU."
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-4xl">
          <p className="mb-12 text-lg text-[var(--muted-foreground)]">
            Reports, policy briefs, and research documents will be published here as we build our capacity. Our work centers on accountability, poverty eradication, legal empowerment (Pillar C), and direct citizen voice.
          </p>
          <div className="relative mb-16 aspect-[21/9] overflow-hidden rounded-2xl">
            <Image
              src={images.resources}
              alt="Resources and documents"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>

          {/* Concept note — key document */}
          <div className="mb-16 rounded-2xl border-2 border-[var(--primary)]/20 bg-[var(--muted)] p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">
              {resourcesConceptNote.title}
            </h2>
            <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
              {resourcesConceptNote.description}
            </p>
            {resourcesConceptNote.fileUrl !== "#" ? (
              <Button href={resourcesConceptNote.fileUrl} className="mt-4">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {resourcesConceptNote.fileLabel}
              </Button>
            ) : (
              <p className="mt-4 text-sm font-medium text-[var(--muted-foreground)]">{resourcesConceptNote.fileLabel}</p>
            )}
          </div>

          <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">
            Document Categories
          </h2>
          <p className="mt-2 mb-8 text-[var(--muted-foreground)]">
            Documents will be added as they become available.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documentCategories.map((item) => (
              <Card
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>

          {/* FAQ link */}
          <div className="mt-16 rounded-xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-xl font-bold text-[var(--foreground)]">
              Have questions?
            </h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Visit our FAQ page for answers to common questions about MBKRU, membership, and our platform.
            </p>
            <Link
              href="/faq"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              View FAQ
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
