import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { newsPlaceholders } from "@/lib/placeholders";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = newsPlaceholders.find((n) => n.slug === slug);
  if (!article) return { title: "Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
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
        <div className="mx-auto max-w-4xl">
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
                Full article content will be added when news is published. This is a placeholder for the article layout.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              ← Back to News & Updates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
