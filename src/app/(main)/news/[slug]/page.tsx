import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownBody } from "@/components/news/MarkdownBody";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  formatPostDate,
  getPublishedPostBySlug,
  postHeroImage,
} from "@/lib/content/posts-db";
import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  if (!isDatabaseConfigured()) return [];
  try {
    const rows = await prisma.post.findMany({
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
  const cms = await getPublishedPostBySlug(slug);
  if (cms) {
    return { title: cms.title, description: cms.excerpt ?? undefined };
  }
  return { title: "Not Found" };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;

  const cms = await getPublishedPostBySlug(slug);
  if (cms) {
    const hero = postHeroImage(cms);
    const dateLabel = formatPostDate(cms.publishedAt, cms.createdAt);
    return (
      <div>
        <PageHeader
          title={cms.title}
          description={
            cms.excerpt
              ? `${dateLabel ? `${dateLabel} — ` : ""}${cms.excerpt}`
              : dateLabel || undefined
          }
          breadcrumbCurrentLabel={cms.title}
        />
        <section className="section-spacing section-full bg-[var(--section-light)]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
              <Image
                src={hero}
                alt={cms.title}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
            <div className="mt-8">
              {dateLabel ? (
                <span className="text-sm font-medium text-[var(--muted-foreground)]">{dateLabel}</span>
              ) : null}
              <div className="mt-6">
                <MarkdownBody content={cms.body} />
              </div>
            </div>
            <div className="mt-10">
              <Link
                href="/news"
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                ← Back to News
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  notFound();
}
