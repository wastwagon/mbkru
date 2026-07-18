import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CommunitiesBrowseFilters } from "@/components/communities/CommunitiesBrowseFilters";
import { CommunityBrowseCard } from "@/components/communities/CommunityBrowseCard";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  activeCommunityVisibilityFilter,
  communityListOrderBy,
  joinPolicyBrowseFilter,
  parseCommunitiesBrowseParams,
  verifiedQueenMotherBrowseFilter,
} from "@/lib/communities-browse-shared";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { searchCommunitiesAndPosts } from "@/lib/server/communities-search";
import { countVerifiedQueenMothersByCommunityIds, countVerifiedQueenMothersByCommunitySlugs, listQueenMotherPortraitPreviewsByCommunityIds } from "@/lib/server/communities-verified";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { normalizeCommunitySearchQuery } from "@/lib/validation/communities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Communities",
  description:
    "Community spaces with forums, threaded discussion, and moderated posts — traditional areas and Queen Mother networks; join policy varies.",
};

type Props = {
  searchParams?: Promise<{ q?: string; region?: string; join?: string; sort?: string; verified?: string }>;
};

export default async function CommunitiesIndexPage({ searchParams }: Props) {
  if (!isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const sp = (await searchParams) ?? {};
  const params = parseCommunitiesBrowseParams(sp);
  const normalized = normalizeCommunitySearchQuery(params.q ?? "");
  const hasQParam = (params.q ?? "").trim().length > 0;
  const invalidShort = hasQParam && !normalized;

  const regionFilter = params.region
    ? await prisma.region.findFirst({
        where: { slug: params.region },
        select: { id: true, slug: true, name: true },
      })
    : null;

  const joinFilter = params.join ?? "all";
  const sort = params.sort ?? "name";
  const verifiedOnly = Boolean(params.verified);
  const joinPolicyForSearch =
    joinFilter === "open" ? ("OPEN" as const) : joinFilter === "approval" ? ("APPROVAL_REQUIRED" as const) : undefined;

  const regionPills = await prisma.region.findMany({
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

  const regionOptions = regionPills.map((r) => ({
    slug: r.slug,
    name: r.name,
    count: r._count.communities,
  }));

  const listWhere = {
    ...activeCommunityVisibilityFilter,
    ...joinPolicyBrowseFilter(joinFilter),
    ...verifiedQueenMotherBrowseFilter(verifiedOnly),
    ...(regionFilter ? { regionId: regionFilter.id } : {}),
  };

  const searchResult =
    normalized && !invalidShort
      ? await searchCommunitiesAndPosts(normalized, {
          regionId: regionFilter?.id,
          joinPolicy: joinPolicyForSearch,
          verifiedOnly,
        })
      : null;

  const communities =
    normalized && !invalidShort
      ? null
      : await prisma.community.findMany({
          where: listWhere,
          orderBy: communityListOrderBy(sort),
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            traditionalAreaName: true,
            joinPolicy: true,
            visibility: true,
            region: { select: { name: true, slug: true } },
            coverMedia: { select: { storagePath: true, alt: true } },
            _count: { select: { memberships: true } },
          },
        });

  const resultCount =
    communities !== null
      ? communities.length
      : searchResult
        ? searchResult.communities.length
        : null;

  const verifiedCountsById =
    communities && communities.length > 0
      ? await countVerifiedQueenMothersByCommunityIds(communities.map((c) => c.id))
      : new Map<string, number>();

  const verifiedCountsBySlug =
    searchResult && searchResult.communities.length > 0
      ? await countVerifiedQueenMothersByCommunitySlugs(searchResult.communities.map((c) => c.slug))
      : new Map<string, number>();

  const searchCommunityIds =
    searchResult && searchResult.communities.length > 0
      ? (
          await prisma.community.findMany({
            where: { slug: { in: searchResult.communities.map((c) => c.slug) } },
            select: { id: true, slug: true },
          })
        )
      : [];

  const portraitCommunityIds = [
    ...(communities?.map((c) => c.id) ?? []),
    ...searchCommunityIds.map((c) => c.id),
  ];
  const portraitsById =
    portraitCommunityIds.length > 0
      ? await listQueenMotherPortraitPreviewsByCommunityIds([...new Set(portraitCommunityIds)])
      : new Map();
  const searchIdBySlug = new Map(searchCommunityIds.map((c) => [c.slug, c.id]));

  return (
    <div>
      <PageHeader
        title="Communities"
        description="Spaces for traditional areas, Queen Mother networks, and local accountability. Each community can host forums (discussion areas), threaded posts, and replies — sign in to join members-only spaces and participate."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
            Independent civic spaces linked to traditional areas — not official Traditional Council channels.{" "}
            <Link href="/methodology" className={primaryNavLinkClass}>
              Methodology
            </Link>
          </p>
          <p className="mt-4 hidden flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-[var(--foreground-secondary)] sm:flex">
            <Link href="/parliament-tracker" className={primaryNavLinkClass}>
              Accountability hub
            </Link>
            <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
              ·
            </span>
            <Link href="/citizens-voice" className={primaryNavLinkClass}>
              MBKRU Voice
            </Link>
          </p>

          <CommunitiesBrowseFilters
            regions={regionOptions}
            params={{ ...params, join: joinFilter, sort, verified: verifiedOnly }}
            invalidShort={invalidShort}
            resultCount={resultCount}
            regionName={regionFilter?.name ?? null}
          />

          {searchResult ? (
            <div className="mt-8 space-y-8">
              {searchResult.communities.length === 0 && searchResult.posts.length === 0 ? (
                <p className="text-center text-sm text-[var(--foreground-secondary)]">No matches for your filters.</p>
              ) : null}
              {searchResult.communities.length > 0 ? (
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">
                    Communities ({searchResult.communities.length})
                  </h2>
                  <ul className="mt-3 space-y-3">
                    {searchResult.communities.map((c) => (
                      <li key={c.slug}>
                        <CommunityBrowseCard
                          slug={c.slug}
                          name={c.name}
                          traditionalAreaName={c.traditionalAreaName}
                          region={c.region}
                          visibility={c.visibility}
                          joinPolicy={c.joinPolicy}
                          description={c.description}
                          memberCount={c.memberCount}
                          verifiedQueenMotherCount={verifiedCountsBySlug.get(c.slug) ?? 0}
                          queenMotherPortraits={
                            portraitsById.get(searchIdBySlug.get(c.slug) ?? "") ?? []
                          }
                          cover={c.cover}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {searchResult.posts.length > 0 ? (
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">Public posts</h2>
                  <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                    From public communities only; members-only posts are not included.
                  </p>
                  <ul className="mt-3 space-y-3">
                    {searchResult.posts.map((p) => (
                      <li key={p.postId}>
                        <Link
                          href={`/communities/${p.communitySlug}/post/${p.postId}`}
                          className="block rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/30"
                        >
                          <p className="text-xs font-medium text-[var(--foreground-secondary)]">{p.communityName}</p>
                          <p className="mt-2 line-clamp-4 text-sm text-[var(--foreground)]">{p.snippet}</p>
                          <p className="mt-2 text-[11px] text-[var(--foreground-secondary)]">
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
            <p className="mt-10 text-center text-sm text-[var(--foreground-secondary)]">
              No communities match these filters. Try another region or clear filters above.
            </p>
          ) : communities ? (
            <>
              {!invalidShort && !regionFilter && joinFilter === "all" ? (
                <h2 className="mt-8 text-sm font-semibold text-[var(--foreground)]">
                  All communities ({communities.length})
                </h2>
              ) : null}
              <ul className={`space-y-3 ${invalidShort || regionFilter || joinFilter !== "all" ? "mt-6" : "mt-4"}`}>
                {communities.map((c) => (
                  <li key={c.slug}>
                    <CommunityBrowseCard
                      slug={c.slug}
                      name={c.name}
                      traditionalAreaName={c.traditionalAreaName}
                      region={c.region}
                      visibility={c.visibility}
                      joinPolicy={c.joinPolicy}
                      description={c.description}
                      memberCount={c._count.memberships}
                      verifiedQueenMotherCount={verifiedCountsById.get(c.id) ?? 0}
                      queenMotherPortraits={portraitsById.get(c.id) ?? []}
                      cover={c.coverMedia}
                    />
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
