import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ResourceDocument } from "@prisma/client";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import {
  formatResourceFileSize,
  getPublishedResourceDocuments,
  resourceCategoryLabel,
} from "@/lib/content/resource-documents";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import {
  focusRingSmClass,
  primaryNavLinkClass,
  resourceTitleLinkClass,
} from "@/lib/primary-link-styles";
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

function groupByCategory(docs: ResourceDocument[]): Record<string, ResourceDocument[]> {
  const order = ["REPORTS", "POLICY_BRIEFS", "RESEARCH", "OTHER"] as const;
  const map: Record<string, ResourceDocument[]> = {};
  for (const k of order) map[k] = [];
  for (const d of docs) {
    const key = d.category;
    if (!map[key]) map[key] = [];
    map[key].push(d);
  }
  return map;
}

export default async function ResourcesPage() {
  const dbOn = isDatabaseConfigured();
  const published = dbOn ? await getPublishedResourceDocuments() : [];
  const grouped = groupByCategory(published);

  return (
    <div>
      <PageHeader
        title="Resources"
        description="Reports, policy briefs, and research documents from MBKRU."
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-4xl">
          <p className="mb-12 text-lg text-[var(--muted-foreground)]">
            Reports, policy briefs, and research documents anchor our accountability and poverty-eradication work —
            including legal empowerment (Pillar C) and direct citizen voice.
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

          <div className="mb-16 rounded-2xl border-2 border-[var(--primary)]/20 bg-[var(--muted)] p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">
              {resourcesConceptNote.title}
            </h2>
            <p className="mt-3 leading-relaxed text-[var(--muted-foreground)]">{resourcesConceptNote.description}</p>
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

          {published.length > 0 ? (
            <div className="mb-16">
              <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">Downloads</h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Verified uploads from our team. Prefer the latest methodology page for how we cite sources.
              </p>
              <div className="mt-8 space-y-10">
                {(["REPORTS", "POLICY_BRIEFS", "RESEARCH", "OTHER"] as const).map((cat) => {
                  const rows = grouped[cat] ?? [];
                  if (rows.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">
                        {resourceCategoryLabel(cat)}
                      </h3>
                      <ul className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
                        {rows.map((d) => (
                          <li key={d.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <Link href={`/resources/${d.slug}`} className={resourceTitleLinkClass}>
                                {d.title}
                              </Link>
                              {d.summary ? (
                                <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{d.summary}</p>
                              ) : null}
                              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                                {d.originalFilename}
                                {d.fileSize ? ` · ${formatResourceFileSize(d.fileSize)}` : ""}
                              </p>
                            </div>
                            <a
                              href={d.filePath}
                              className={`inline-flex shrink-0 touch-manipulation items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-95 ${focusRingSmClass}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : dbOn ? (
            <p className="mb-16 rounded-xl border border-[var(--border)] bg-white p-6 text-center text-sm text-[var(--muted-foreground)]">
              Published documents will appear here. Editors can upload from{" "}
              <Link href="/admin/resources" className={`${primaryNavLinkClass} font-semibold`}>
                Admin → Resource library
              </Link>
              .
            </p>
          ) : null}

          <h2 className="font-display text-2xl font-bold text-[var(--foreground)]">Document categories</h2>
          <p className="mt-2 mb-8 text-[var(--muted-foreground)]">
            We group materials for easy browsing. Additional files appear in the downloads section above when
            published.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documentCategories.map((item) => (
              <Card key={item.title} icon={item.icon} title={item.title} description={item.description} />
            ))}
          </div>

          <div className="mt-16 rounded-xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-xl font-bold text-[var(--foreground)]">Have questions?</h2>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Visit our FAQ page for answers to common questions about MBKRU, membership, and our platform.
            </p>
            <Link href="/faq" className={`${primaryNavLinkClass} mt-4 gap-2 text-sm font-semibold`}>
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
