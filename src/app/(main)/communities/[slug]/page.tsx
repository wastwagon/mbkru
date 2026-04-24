import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CommunityMemberPanel } from "@/components/communities/CommunityMemberPanel";
import { ReportCommunityPostButton } from "@/components/communities/ReportCommunityPostButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import {
  canReadCommunityFullDetail,
  canReadCommunityPosts,
  findMembership,
} from "@/lib/server/communities-access";
import { listCommunityPostsVisibleToViewer } from "@/lib/server/community-posts-public";
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug.trim().toLowerCase();
  if (!isCommunitySlug(slug) || !isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) {
    return { title: "Community" };
  }
  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { name: true },
  });
  return { title: c?.name ?? "Community" };
}

export default async function CommunityDetailPage({ params }: Props) {
  if (!isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const slug = (await params).slug.trim().toLowerCase();
  if (!isCommunitySlug(slug)) notFound();

  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      region: { select: { name: true } },
      _count: { select: { memberships: true } },
    },
  });

  if (!c) notFound();

  const session = await getMemberSession();
  const membership = session ? await findMembership(c.id, session.memberId) : null;

  const showFullAbout = canReadCommunityFullDetail(c.visibility, membership);
  const showPosts = canReadCommunityPosts(c.visibility, membership);
  const posts = showPosts
    ? await listCommunityPostsVisibleToViewer(c.id, session?.memberId ?? null)
    : [];

  const memberAccountsEnabled = platformFeatures.authentication(getServerPlatformPhase());

  const headerDescription =
    c.traditionalAreaName ??
    (c.visibility === "MEMBERS_ONLY" ? "Members-only community on MBKRU" : undefined);

  return (
    <div>
      <PageHeader title={c.name} description={headerDescription} />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/communities" className={primaryNavLinkClass}>
              ← All communities
            </Link>
          </p>
          <dl className="mt-6 space-y-2 text-sm text-[var(--muted-foreground)]">
            <div>
              <dt className="inline font-medium text-[var(--foreground)]">Visibility: </dt>
              <dd className="inline">{c.visibility === "PUBLIC" ? "Public" : "Members only"}</dd>
            </div>
            {c.region ? (
              <div>
                <dt className="inline font-medium text-[var(--foreground)]">Region: </dt>
                <dd className="inline">{c.region.name}</dd>
              </div>
            ) : null}
            <div>
              <dt className="inline font-medium text-[var(--foreground)]">Join policy: </dt>
              <dd className="inline">{c.joinPolicy === "OPEN" ? "Open" : "Approval required"}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-[var(--foreground)]">Members: </dt>
              <dd className="inline tabular-nums">{c._count.memberships}</dd>
            </div>
          </dl>
          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">About</h2>
            {showFullAbout ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted-foreground)]">
                {c.description}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {c.visibility === "MEMBERS_ONLY"
                  ? "The full description is available to active members of this community. Use membership below to join or sign in."
                  : c.description}
              </p>
            )}
          </div>

          <CommunityMemberPanel
            communitySlug={c.slug}
            joinPolicy={c.joinPolicy}
            visibility={c.visibility}
            restrictedDetail={!showFullAbout}
            memberAccountsEnabled={memberAccountsEnabled}
          />

          <section className="mt-10">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Posts</h2>
            {!showPosts ? (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Posts are visible to active members only.
              </p>
            ) : posts.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">No posts yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {posts.map((p) => (
                  <li key={p.id} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <span className="font-medium uppercase tracking-wide text-[var(--foreground)]">{p.kind}</span>
                      <span>·</span>
                      <span>{p.author.displayName ?? "Member"}</span>
                      <span>·</span>
                      <time dateTime={p.createdAt.toISOString()}>
                        {p.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </time>
                      {p.moderationStatus !== "PUBLISHED" ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                          {p.moderationStatus.toLowerCase()}
                        </span>
                      ) : null}
                      {p.pinned ? (
                        <span className="rounded-full bg-[var(--section-light)] px-2 py-0.5 text-[10px] font-semibold uppercase">
                          Pinned
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--foreground)]">{p.body}</p>
                    <p className="mt-2 text-xs">
                      <Link href={`/communities/${c.slug}/post/${p.id}`} className={primaryLinkClass}>
                        Permalink
                      </Link>
                    </p>
                    <ReportCommunityPostButton
                      communitySlug={c.slug}
                      postId={p.id}
                      authorMemberId={p.author.id}
                      viewerMemberId={session?.memberId ?? null}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
            For urgent wrongdoing, see{" "}
            <Link href="/whistleblowing" className={primaryLinkClass}>
              whistleblowing guidance
            </Link>{" "}
            and{" "}
            <Link href="/citizens-voice" className={primaryLinkClass}>
              MBKRU Voice
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
