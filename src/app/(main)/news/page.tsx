import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPostDate, getPublishedPostSummaries, postHeroImage } from "@/lib/content/posts-db";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export const metadata: Metadata = {
  title: "News",
  description:
    "News, press releases, and advocacy updates from MBKRU.",
};

export default async function NewsPage() {
  const cmsPosts = await getPublishedPostSummaries();

  if (cmsPosts.length === 0) {
    return (
      <div>
        <PageHeader
          title="News"
          description="Latest news, press releases, and advocacy updates from My Brother's Keeper Restoration United (MBKRU)."
        />
        <section className="section-spacing section-full bg-[var(--section-light)]">
          <div className="mx-auto max-w-lg px-4 text-center sm:px-6 lg:px-8">
            <p className="text-[var(--muted-foreground)]">No published news posts yet.</p>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              Editors with access can create and publish posts from{" "}
              <Link href="/admin/posts" className={`${primaryLinkClass} font-semibold`}>
                Admin → Posts
              </Link>
              . They appear here and on the homepage automatically.
            </p>
          </div>
        </section>
      </div>
    );
  }

  const featured = cmsPosts[0];
  const previews = cmsPosts.slice(1, 3);
  const featuredImage = postHeroImage(featured);
  const dateLabel = formatPostDate(featured.publishedAt, featured.createdAt);

  return (
    <div>
      <PageHeader
        title="News"
        description="Latest news, press releases, and advocacy updates from My Brother's Keeper Restoration United (MBKRU)."
      />
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                const thumb = postHeroImage(article);
                const d = formatPostDate(article.publishedAt, article.createdAt);
                return (
                  <Link
                    key={article.id}
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
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-white/50 p-8 text-center text-sm text-[var(--muted-foreground)]">
                  Add more published posts to show previews here.
                </div>
              ) : null}
            </div>
          </div>
          <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
            More updates coming soon. Subscribe to our newsletter to stay informed.
          </p>
        </div>
      </section>
    </div>
  );
}
