import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { activeCommunityVisibilityFilter, communitiesBrowseHref } from "@/lib/communities-browse-shared";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { searchCommunitiesAndPosts } from "@/lib/server/communities-search";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import { focusRingSmClass, focusRingPillClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { normalizeCommunitySearchQuery } from "@/lib/validation/communities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Communities",
  description:
    "Community spaces with forums, threaded discussion, and moderated posts — traditional areas and Queen Mother networks; join policy varies.",
};

type Props = { searchParams?: Promise<{ q?: string; region?: string }> };

export default async function CommunitiesIndexPage({ searchParams }: Props) {
  if (!isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const sp = (await searchParams) ?? {};
  const rawQ = typeof sp.q === "string" ? sp.q : "";
  const regionParam = typeof sp.region === "string" ? sp.region.trim() : "";
  const normalized = normalizeCommunitySearchQuery(rawQ);
  const hasQParam = rawQ.trim().length > 0;
  const invalidShort = hasQParam && !normalized;

  const regionFilter = regionParam
    ? await prisma.region.findFirst({
        where: { slug: regionParam },
        select: { id: true, slug: true, name: true },
      })
    : null;

  const searchResult = normalized ? await searchCommunitiesAndPosts(normalized) : null;

  const regionPills = normalized
    ? null
    : await prisma.region.findMany({
        where: {
          communities: { some: activeCommunityVisibilityFilter },
        },
        orderBy: { sortOrder: "asc" },
        select: {
          slug: true,
          name: true,
          _count: {
            select: {
              communities: { where: activeCommunityVisibilityFilter },
            },
          },
        },
      });

  const communities = normalized
    ? null
    : await prisma.community.findMany({
        where: {
          ...activeCommunityVisibilityFilter,
          ...(regionFilter ? { regionId: regionFilter.id } : {}),
        },
        orderBy: { name: "asc" },
        select: {
          slug: true,
          name: true,
          description: true,
          traditionalAreaName: true,
          joinPolicy: true,
          visibility: true,
          region: { select: { name: true, slug: true } },
        },
      });

  return (
    <div>
      <PageHeader
        title="Communities"
        description="Spaces for traditional areas, Queen Mother networks, and local accountability. Each community can host forums (discussion areas), threaded posts, and replies — sign in to join members-only spaces and participate."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="rounded-xl border border-[var(--border)] bg-white/90 px-4 py-3 text-xs leading-relaxed text-[var(--muted-foreground)] sm:text-sm">
            Independent civic spaces linked to named traditional areas — not official Traditional Council channels.
            Queen Mothers can request verified status after joining. See{" "}
            <Link href="/methodology" className={primaryNavLinkClass}>
              methodology
            </Link>
            .
          </p>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/parliament-tracker" className={primaryNavLinkClass}>
              Accountability hub
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link href="/citizens-voice" className={primaryNavLinkClass}>
              MBKRU Voice
            </Link>
          </p>

          <form
            action="/communities"
            method="get"
            className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center"
            role="search"
          >
            <label htmlFor="community-search" className="sr-only">
              Search communities and posts
            </label>
            <input
              id="community-search"
              name="q"
              type="search"
              defaultValue={rawQ}
              placeholder="Search communities and public posts…"
              minLength={2}
              maxLength={120}
              className={`w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] shadow-sm transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`}
            />
            <button
              type="submit"
              className={`min-h-11 w-full shrink-0 touch-manipulation rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] active:scale-[0.99] motion-reduce:active:scale-100 sm:min-h-0 sm:w-auto ${focusRingSmClass}`}
            >
              Search
            </button>
          </form>
          {invalidShort ? (
            <p className="mt-2 text-sm text-amber-800">Enter at least 2 characters to search.</p>
          ) : null}
          {normalized ? (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Results for &quot;{normalized}&quot; ·{" "}
              <Link href="/communities" className={primaryNavLinkClass}>
                Clear
              </Link>
            </p>
          ) : null}

          {!normalized && regionPills && regionPills.length > 0 ? (
            <nav
              className="mt-6 flex flex-wrap gap-2"
              aria-label="Filter communities by region"
            >
              <Link
                href={communitiesBrowseHref({})}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  !regionFilter
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/40"
                } ${focusRingPillClass}`}
              >
                All regions
              </Link>
              {regionPills.map((r) => {
                const active = regionFilter?.slug === r.slug;
                return (
                  <Link
                    key={r.slug}
                    href={communitiesBrowseHref({ region: r.slug })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/40"
                    } ${focusRingPillClass}`}
                  >
                    {r.name}
                    <span className="ml-1 font-normal opacity-80">({r._count.communities})</span>
                  </Link>
                );
              })}
            </nav>
          ) : null}

          {regionParam && !regionFilter && !normalized ? (
            <p className="mt-4 text-sm text-amber-800">
              Unknown region filter.{" "}
              <Link href="/communities" className={primaryNavLinkClass}>
                Show all communities
              </Link>
            </p>
          ) : null}

          {regionFilter && !normalized ? (
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              Showing {regionFilter.name} ·{" "}
              <Link href="/communities" className={primaryNavLinkClass}>
                Clear region
              </Link>
            </p>
          ) : null}

          {searchResult ? (
            <div className="mt-8 space-y-8">
              {searchResult.communities.length === 0 && searchResult.posts.length === 0 ? (
                <p className="text-center text-sm text-[var(--muted-foreground)]">No matches.</p>
              ) : null}
              {searchResult.communities.length > 0 ? (
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">Communities</h2>
                  <ul className="mt-3 space-y-4">
                    {searchResult.communities.map((c) => (
                      <li key={c.slug}>
                        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/30">
                          <Link href={`/communities/${c.slug}`} className="block">
                            <span className="font-semibold text-[var(--foreground)]">{c.name}</span>
                            {c.visibility === "MEMBERS_ONLY" ? (
                              <span className="ml-2 rounded-full bg-[var(--section-light)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--foreground)]">
                                Members only
                              </span>
                            ) : null}
                            {c.traditionalAreaName ? (
                              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{c.traditionalAreaName}</p>
                            ) : null}
                            {c.region ? (
                              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{c.region.name}</p>
                            ) : null}
                            {c.visibility === "MEMBERS_ONLY" ? (
                              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                                Members-only community — sign in on the community page to read details and posts.
                              </p>
                            ) : (
                              <p className="mt-2 line-clamp-3 text-sm text-[var(--muted-foreground)]">
                                {c.description}
                              </p>
                            )}
                            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                              Join: {c.joinPolicy === "OPEN" ? "Open" : "Approval required"}
                            </p>
                          </Link>
                          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-[var(--border)] pt-3 text-xs font-medium">
                            <Link href={`/communities/${c.slug}`} className={primaryNavLinkClass}>
                              Overview
                            </Link>
                            <Link href={`/communities/${c.slug}/portal`} className={primaryNavLinkClass}>
                              Council workspace
                            </Link>
                            <Link href={`/communities/${c.slug}/forums`} className={primaryNavLinkClass}>
                              Forums &amp; threads
                            </Link>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {searchResult.posts.length > 0 ? (
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">Public posts</h2>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    From public communities only; members-only posts are not included.
                  </p>
                  <ul className="mt-3 space-y-3">
                    {searchResult.posts.map((p) => (
                      <li key={p.postId}>
                        <Link
                          href={`/communities/${p.communitySlug}/post/${p.postId}`}
                          className="block rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/30"
                        >
                          <p className="text-xs font-medium text-[var(--muted-foreground)]">{p.communityName}</p>
                          <p className="mt-2 line-clamp-4 text-sm text-[var(--foreground)]">{p.snippet}</p>
                          <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">
                            {new Date(p.createdAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : communities && communities.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
              No active communities are listed yet. Check back soon.
            </p>
          ) : communities ? (
            <>
              {invalidShort ? (
                <h2 className="mt-10 text-sm font-semibold text-[var(--foreground)]">All communities</h2>
              ) : null}
              <ul className={`space-y-4 ${invalidShort ? "mt-3" : "mt-10"}`}>
                {communities.map((c) => (
                  <li key={c.slug}>
                    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/30">
                      <Link href={`/communities/${c.slug}`} className="block">
                        <span className="font-semibold text-[var(--foreground)]">{c.name}</span>
                        {c.visibility === "MEMBERS_ONLY" ? (
                          <span className="ml-2 rounded-full bg-[var(--section-light)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--foreground)]">
                            Members only
                          </span>
                        ) : null}
                        {c.traditionalAreaName ? (
                          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{c.traditionalAreaName}</p>
                        ) : null}
                        {c.region ? (
                          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{c.region.name}</p>
                        ) : null}
                        {c.visibility === "MEMBERS_ONLY" ? (
                          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                            Members-only community — sign in on the community page to read details and posts.
                          </p>
                        ) : (
                          <p className="mt-2 line-clamp-3 text-sm text-[var(--muted-foreground)]">{c.description}</p>
                        )}
                        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                          Join: {c.joinPolicy === "OPEN" ? "Open" : "Approval required"}
                        </p>
                      </Link>
                      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-[var(--border)] pt-3 text-xs font-medium">
                        <Link href={`/communities/${c.slug}`} className={primaryNavLinkClass}>
                          Overview
                        </Link>
                        <Link href={`/communities/${c.slug}/portal`} className={primaryNavLinkClass}>
                          Council workspace
                        </Link>
                        <Link href={`/communities/${c.slug}/forums`} className={primaryNavLinkClass}>
                          Forums &amp; threads
                        </Link>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
