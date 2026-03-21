import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/news/ArticleBody";
import { PageHeader } from "@/components/ui/PageHeader";
import { images, newsPlaceholders } from "@/lib/placeholders";
import { formatPostDate, getPostBySlug, getPostSlugs } from "@/lib/sanity/posts";
import { urlForImage } from "@/lib/sanity/image";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cms = await getPostBySlug(slug);
  if (cms) {
    return {
      title: cms.title,
      description: cms.excerpt ?? undefined,
    };
  }
  const article = newsPlaceholders.find((n) => n.slug === slug);
  if (!article) return { title: "Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;

  const cms = await getPostBySlug(slug);
  if (cms) {
    const hero = urlForImage(cms.mainImage, 1600) ?? images.news;
    const dateLabel = formatPostDate(cms.publishedAt, cms._createdAt);

    return (
      <div>
        <PageHeader
          title={cms.title}
          description={cms.excerpt ? `${dateLabel ? `${dateLabel} — ` : ""}${cms.excerpt}` : dateLabel || undefined}
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
              <ArticleBody body={cms.body} />
              {!cms.body || (Array.isArray(cms.body) && cms.body.length === 0) ? (
                cms.excerpt ? (
                  <div className="prose prose-slate max-w-none prose-p:text-[var(--muted-foreground)]">
                    <p>{cms.excerpt}</p>
                  </div>
                ) : null
              ) : null}
            </div>
            <div className="mt-10">
              <Link
                href="/news"
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                ← Back to News & Updates
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const article = newsPlaceholders.find((n) => n.slug === slug);
  if (!article) notFound();

  return (
    <div>
      <PageHeader
        title={article.title}
        description={`${article.date} — ${article.excerpt}`}
        breadcrumbCurrentLabel={article.title}
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
          <div className="mt-8">
            <span className="text-sm font-medium text-[var(--muted-foreground)]">{article.date}</span>
            <div className="mt-6 prose prose-slate max-w-none prose-headings:font-display prose-headings:text-[var(--foreground)] prose-p:text-[var(--muted-foreground)]">
              <p>{article.excerpt}</p>
              <p>
                Full article content will appear when this story is published from Sanity CMS. This is a sample layout.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/news"
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              ← Back to News & Updates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
