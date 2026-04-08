import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { searchCommunitiesAndPosts } from "@/lib/server/communities-search";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import { normalizeCommunitySearchQuery } from "@/lib/validation/communities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Communities",
  description: "Public community spaces linked to traditional areas and Queen Mother networks — join policy and membership vary by community.",
};

type Props = { searchParams?: Promise<{ q?: string }> };

export default async function CommunitiesIndexPage({ searchParams }: Props) {
  if (!isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const sp = (await searchParams) ?? {};
  const rawQ = typeof sp.q === "string" ? sp.q : "";
  const normalized = normalizeCommunitySearchQuery(rawQ);
  const hasQParam = rawQ.trim().length > 0;
  const invalidShort = hasQParam && !normalized;

  const searchResult = normalized ? await searchCommunitiesAndPosts(normalized) : null;

  const communities = normalized
    ? null
    : await prisma.community.findMany({
        where: { status: "ACTIVE", visibility: { in: ["PUBLIC", "MEMBERS_ONLY"] } },
        orderBy: { name: "asc" },
        select: {
          slug: true,
          name: true,
          description: true,
          traditionalAreaName: true,
          joinPolicy: true,
          visibility: true,
          region: { select: { name: true } },
        },
      });

  return (
    <div>
      <PageHeader
        title="Communities"
        description="Spaces for traditional areas, Queen Mother networks, and local accountability. Some listings are members-only — sign in to see full details and posts where applicable."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            <Link href="/parliament-tracker" className="text-[var(--primary)] hover:underline">
              Accountability hub
            </Link>
            {" · "}
            <Link href="/citizens-voice" className="text-[var(--primary)] hover:underline">
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
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] shadow-sm"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
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
              <Link href="/communities" className="text-[var(--primary)] hover:underline">
                Clear
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
                        <Link
                          href={`/communities/${c.slug}`}
                          className="block rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/30"
                        >
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
                    <Link
                      href={`/communities/${c.slug}`}
                      className="block rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/30"
                    >
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
