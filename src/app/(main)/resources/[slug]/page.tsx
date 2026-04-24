import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  formatResourceFileSize,
  getPublishedResourceDocumentBySlug,
  resourceCategoryLabel,
} from "@/lib/content/resource-documents";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (!isDatabaseConfigured()) return [];
  try {
    const rows = await prisma.resourceDocument.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true },
    });
    return rows.map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getPublishedResourceDocumentBySlug(slug);
  if (!doc) {
    return { title: "Resource" };
  }
  const description =
    doc.summary ?? `Download — ${doc.originalFilename} (${resourceCategoryLabel(doc.category)})`;
  return {
    title: doc.title,
    description,
    openGraph: {
      title: doc.title,
      description,
      type: "article",
    },
  };
}

export default async function ResourceDocumentDetailPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getPublishedResourceDocumentBySlug(slug);
  if (!doc) notFound();

  const sizeLabel = formatResourceFileSize(doc.fileSize);

  return (
    <div>
      <PageHeader
        title={doc.title}
        description={
          doc.summary ??
          `${resourceCategoryLabel(doc.category)} · ${doc.originalFilename}${sizeLabel ? ` · ${sizeLabel}` : ""}`
        }
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/resources" className={primaryNavLinkClass}>
              ← All resources
            </Link>
          </p>
          <dl className="mt-8 space-y-4 rounded-2xl border border-[var(--border)] bg-white p-6 text-sm">
            <div>
              <dt className="font-medium text-[var(--muted-foreground)]">Category</dt>
              <dd className="mt-1 text-[var(--foreground)]">{resourceCategoryLabel(doc.category)}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted-foreground)]">File</dt>
              <dd className="mt-1 text-[var(--foreground)]">{doc.originalFilename}</dd>
            </div>
            {sizeLabel ? (
              <div>
                <dt className="font-medium text-[var(--muted-foreground)]">Size</dt>
                <dd className="mt-1 text-[var(--foreground)]">{sizeLabel}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href={doc.filePath}>
              Download
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </Button>
            <Link href="/methodology" className={`${primaryNavLinkClass} text-sm font-semibold`}>
              How we cite sources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
