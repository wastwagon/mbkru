import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { images, newsPlaceholders } from "@/lib/placeholders";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "News, press releases, and advocacy updates from MBKRU.",
};

export default function NewsPage() {
  const featured = newsPlaceholders.find((n) => n.featured) ?? newsPlaceholders[0];
  const previews = newsPlaceholders.filter((n) => !n.featured).slice(0, 2);

  return (
    <div>
      <PageHeader
        title="News & Updates"
        description="Latest news, press releases, and advocacy updates from My Brother's Keeper Restoration United (MBKRU)."
      />

      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl">
          {/* Blog2 layout: featured left, 2 previews right */}
          <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
            {/* Featured article — large image + overlay content */}
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
                    <p className="mt-2 line-clamp-2 text-sm text-white/90">
                      {featured.excerpt}
                    </p>
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

            {/* 2 preview cards stacked */}
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
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                      {article.excerpt}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                      Learn more
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
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
