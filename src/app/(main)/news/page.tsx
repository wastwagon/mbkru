import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { images, newsPlaceholders } from "@/lib/placeholders";
import { formatPostDate, getPostSummaries, type PostSummary } from "@/lib/sanity/posts";
import { urlForImage } from "@/lib/sanity/image";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "News, press releases, and advocacy updates from MBKRU.",
};

function CmsNewsLayout({ posts }: { posts: PostSummary[] }) {
  const featured = posts[0];
  const previews = posts.slice(1, 3);
  const featuredImage = urlForImage(featured.mainImage, 1400) ?? images.news;
  const dateLabel = formatPostDate(featured.publishedAt, featured._createdAt);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
      <div className="group">
        <Link href={`/news/${featured.slug}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={featuredImage}
              alt={featured.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              {dateLabel ? (
                <span className="mb-2 text-sm font-medium text-[var(--accent-gold)]">{dateLabel}</span>
              ) : null}
              <h2 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                {featured.title}
              </h2>
              {featured.excerpt ? (
                <p className="mt-2 line-clamp-2 text-sm text-white/90">{featured.excerpt}</p>
              ) : null}
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
                Read more
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {previews.map((article) => {
          const thumb = urlForImage(article.mainImage, 640) ?? images.news;
          const d = formatPostDate(article.publishedAt, article._createdAt);
          return (
            <Link
              key={article._id}
              href={`/news/${article.slug}`}
              className="group flex flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:border-[var(--primary)]/20 hover:shadow-[var(--shadow-card-hover)] sm:flex-row sm:gap-6"
            >
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-40">
                <Image
                  src={thumb}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 160px"
                />
              </div>
              <div className="min-w-0 flex-1">
                {d ? (
                  <span className="text-sm font-medium text-[var(--muted-foreground)]">{d}</span>
                ) : null}
                <h3 className="mt-1 font-display text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  {article.title}
                </h3>
                {article.excerpt ? (
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">{article.excerpt}</p>
                ) : null}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                  Learn more
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
        {previews.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--section-light)]/50 p-8 text-center text-sm text-[var(--muted-foreground)]">
            Publish more posts in Sanity Studio to appear here.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PlaceholderNewsLayout() {
  const featured = newsPlaceholders.find((n) => n.featured) ?? newsPlaceholders[0];
  const previews = newsPlaceholders.filter((n) => !n.featured).slice(0, 2);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
      <div className="group">
        <Link href={`/news/${featured.slug}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <span className="mb-2 text-sm font-medium text-[var(--accent-gold)]">{featured.date}</span>
              <h2 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                {featured.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-white/90">{featured.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
                Read more
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {previews.map((article) => (
          <Link
            key={article.slug}
            href={`/news/${article.slug}`}
            className="group flex flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:border-[var(--primary)]/20 hover:shadow-[var(--shadow-card-hover)] sm:flex-row sm:gap-6"
          >
            <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-40">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 160px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-[var(--muted-foreground)]">{article.date}</span>
              <h3 className="mt-1 font-display text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                {article.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">{article.excerpt}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                Learn more
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function NewsPage() {
  const cmsPosts = await getPostSummaries();
  const useCms = cmsPosts.length > 0;

  return (
    <div>
      <PageHeader
        title="News & Updates"
        description="Latest news, press releases, and advocacy updates from My Brother's Keeper Restoration United (MBKRU)."
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!useCms ? (
            <p className="mb-8 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-center text-sm text-[var(--muted-foreground)] shadow-sm">
              Sample stories below. Connect{" "}
              <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SANITY_PROJECT_ID</code>{" "}
              and publish <strong className="text-[var(--foreground)]">post</strong> documents in{" "}
              <Link href="/studio" className="font-semibold text-[var(--primary)] hover:underline">
                Sanity Studio
              </Link>{" "}
              to show live content.
            </p>
          ) : null}

          {useCms ? <CmsNewsLayout posts={cmsPosts} /> : <PlaceholderNewsLayout />}

          <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
            More updates coming soon. Subscribe to our newsletter to stay informed.
          </p>
        </div>
      </section>
    </div>
  );
}
