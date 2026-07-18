import Link from "next/link";

import { CommunityBrowseCard } from "@/components/communities/CommunityBrowseCard";
import {
  activeCommunityVisibilityFilter,
  communitiesBrowseHref,
} from "@/lib/communities-browse-shared";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import { focusRingSmClass } from "@/lib/primary-link-styles";
import { countVerifiedQueenMothersByCommunityIds, listQueenMotherPortraitPreviewsByCommunityIds } from "@/lib/server/communities-verified";

type Props = { regionSlug: string; regionName: string };

export async function RegionCommunitiesSpotlight({ regionSlug, regionName }: Props) {
  if (!isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) return null;

  const region = await prisma.region.findUnique({
    where: { slug: regionSlug },
    select: { id: true, name: true, slug: true },
  });
  if (!region) return null;

  const communities = await prisma.community.findMany({
    where: {
      ...activeCommunityVisibilityFilter,
      regionId: region.id,
    },
    orderBy: { name: "asc" },
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
    take: 6,
  });

  if (communities.length === 0) return null;

  const total = await prisma.community.count({
    where: {
      ...activeCommunityVisibilityFilter,
      regionId: region.id,
    },
  });

  const verifiedById = await countVerifiedQueenMothersByCommunityIds(communities.map((c) => c.id));
  const portraitsById = await listQueenMotherPortraitPreviewsByCommunityIds(communities.map((c) => c.id));
  const verifiedTotal = [...verifiedById.values()].reduce((n, v) => n + v, 0);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Queen Mother &amp; traditional spaces</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-secondary)]">
        {total} civic {total === 1 ? "space" : "spaces"} linked to traditional areas in {regionName}. Join open spaces
        instantly and connect with verified Queen Mothers after sign-in.
      </p>
      {verifiedTotal > 0 ? (
        <p className="mt-2 text-xs font-semibold text-[var(--accent-gold)]">
          {verifiedTotal} verified Queen Mother {verifiedTotal === 1 ? "profile" : "profiles"} among featured spaces
        </p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {communities.map((c) => (
          <li key={c.slug}>
            <CommunityBrowseCard
              slug={c.slug}
              name={c.name}
              description={c.description}
              traditionalAreaName={c.traditionalAreaName}
              region={c.region ?? { name: region.name, slug: region.slug }}
              visibility={c.visibility}
              joinPolicy={c.joinPolicy}
              memberCount={c._count.memberships}
              verifiedQueenMotherCount={verifiedById.get(c.id) ?? 0}
              queenMotherPortraits={portraitsById.get(c.id) ?? []}
              cover={c.coverMedia}
            />
          </li>
        ))}
      </ul>
      {total > communities.length ? (
        <p className="mt-3 text-xs text-[var(--foreground-secondary)]">
          + {total - communities.length} more in {regionName}
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={communitiesBrowseHref({ region: regionSlug, join: "open" })}
          className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`}
        >
          Browse {regionName} spaces
        </Link>
        <Link
          href={communitiesBrowseHref({ region: regionSlug, verified: true })}
          className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--accent-gold)]/40 bg-[var(--accent-gold-light)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-gold)] transition-colors hover:border-[var(--accent-gold)]/60 sm:w-auto ${focusRingSmClass}`}
        >
          Verified Queen Mothers
        </Link>
      </div>
    </section>
  );
}
