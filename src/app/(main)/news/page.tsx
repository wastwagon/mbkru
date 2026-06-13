import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatPublishedNewsCount } from "@/lib/public-news-copy";
import { getPublicNewsCatalog } from "@/lib/public-news-catalog";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export const metadata: Metadata = {
  title: "News",
  description:
    "News, press releases, and advocacy updates from MBKRU.",
};

export default async function NewsPage() {
  const newsCatalog = await getPublicNewsCatalog();
  const total = newsCatalog.length;
  const pageDescription =
    total > 0
      ? `${formatPublishedNewsCount(total)} from My Brother's Keeper Restoration United (MBKRU) — published from Admin → Posts.`
      : "Latest news, press releases, and advocacy updates from My Brother's Keeper Restoration United (MBKRU).";

  if (total === 0) {
    return (
      <div>
        <PageHeader title="News" description={pageDescription} />
        <section className="section-spacing section-full bg-[var(--section-light)]">
          <div className="mx-auto max-w-lg px-4 text-center sm:px-6 lg:px-8">
            <p className="text-[var(--foreground-secondary)]">{formatPublishedNewsCount(0)}</p>
            <p className="mt-4 text-sm text-[var(--foreground-secondary)]">
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

  const featured = newsCatalog[0];
  const sidebarItems = newsCatalog.slice(1, 3);
  const remaining = newsCatalog.slice(3);

  return (
    <div>
      <PageHeader title="News" description={pageDescription} />
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium text-[var(--foreground-secondary)] sm:text-left">
            Showing all {total} {total === 1 ? "story" : "stories"} — newest first.
          </p>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
            <div className="group">
              <Link href={featured.href} className="block">
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
                    {featured.dateLabel ? (
                      <span className="mb-2 text-sm font-medium text-[var(--accent-gold)]">{featured.dateLabel}</span>
                    ) : null}
                    <h2 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm text-white/90">{featured.excerpt}</p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
                      Read more
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex flex-col gap-6">
              {sidebarItems.map((article) => (
                <Link
                  key={article.id}
                  href={article.href}
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
                    {article.dateLabel ? (
                      <span className="text-sm font-medium text-[var(--foreground-secondary)]">{article.dateLabel}</span>
                    ) : null}
                    <h3 className="mt-1 font-display text-lg font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                      {article.title}
                    </h3>
                    {article.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--foreground-secondary)]">{article.excerpt}</p>
                    ) : null}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                      Learn more
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
              {sidebarItems.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-white/50 p-8 text-center text-sm text-[var(--foreground-secondary)]">
                  Only one story is published right now.
                </div>
              ) : null}
            </div>
          </div>

          {remaining.length > 0 ? (
            <div className="mt-12 border-t border-[var(--border)] pt-10">
              <h2 className="font-display text-lg font-bold text-[var(--foreground)] sm:text-xl">
                Earlier updates ({remaining.length})
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {remaining.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={article.href}
                      className="group flex h-full flex-col rounded-xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]/25"
                    >
                      <span className="text-xs font-medium text-[var(--foreground-secondary)]">{article.dateLabel}</span>
                      <h3 className="mt-2 font-display text-base font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                        {article.title}
                      </h3>
                      {article.excerpt ? (
                        <p className="mt-2 line-clamp-3 flex-1 text-sm text-[var(--foreground-secondary)]">
                          {article.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-4 text-sm font-semibold text-[var(--primary)]">Read story →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
