import Link from "next/link";

import {
  activeCommunityVisibilityFilter,
  communitiesBrowseHref,
} from "@/lib/communities-browse-shared";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import { focusRingSmClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { countVerifiedQueenMothersByCommunityIds } from "@/lib/server/communities-verified";

type Props = { regionSlug: string; regionName: string };

export async function RegionCommunitiesSpotlight({ regionSlug, regionName }: Props) {
  if (!isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) return null;

  const region = await prisma.region.findUnique({
    where: { slug: regionSlug },
    select: { id: true },
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
      traditionalAreaName: true,
      joinPolicy: true,
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
  const verifiedTotal = [...verifiedById.values()].reduce((n, v) => n + v, 0);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Queen Mother &amp; traditional spaces</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {total} civic {total === 1 ? "space" : "spaces"} linked to traditional areas in {regionName}. Filter by town,
        join instantly where open, and connect with verified Queen Mothers after sign-in.
      </p>
      {verifiedTotal > 0 ? (
        <p className="mt-2 text-xs font-medium text-[var(--primary)]">
          {verifiedTotal} verified Queen Mother {verifiedTotal === 1 ? "profile" : "profiles"} among featured spaces
        </p>
      ) : null}
      <ul className="mt-4 space-y-2">
        {communities.map((c) => (
          <li key={c.slug} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
            <Link href={`/communities/${c.slug}`} className={`font-medium ${primaryNavLinkClass}`}>
              {c.traditionalAreaName ?? c.name}
            </Link>
            <span className="text-xs text-[var(--muted-foreground)]">
              {c.joinPolicy === "OPEN" ? "Open to join" : "Approval required"}
              {verifiedById.get(c.id) ? " · Verified QM" : null}
            </span>
          </li>
        ))}
      </ul>
      {total > communities.length ? (
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          + {total - communities.length} more in {regionName}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={communitiesBrowseHref({ region: regionSlug, join: "open" })}
            className={`inline-flex min-h-10 items-center rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] ${focusRingSmClass}`}
          >
            Browse {regionName} spaces
          </Link>
          <Link
            href={communitiesBrowseHref({ region: regionSlug, verified: true })}
            className={`inline-flex min-h-10 items-center rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--section-light)] ${focusRingSmClass}`}
          >
            Verified Queen Mothers
          </Link>
      </div>
    </section>
  );
}
