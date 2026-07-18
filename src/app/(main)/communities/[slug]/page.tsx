import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CommunityMemberPanel } from "@/components/communities/CommunityMemberPanel";
import { CommunityQueenMotherBadge } from "@/components/communities/CommunityQueenMotherBadge";
import { CommunityQueenMotherRoster } from "@/components/communities/CommunityQueenMotherRoster";
import { CommunityThreadCard } from "@/components/communities/CommunityThreadCard";
import { CommunityOnlinePresence } from "@/components/member/CommunityOnlinePresence";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { communitiesBrowseHref } from "@/lib/communities-browse-shared";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import {
  canReadCommunityFullDetail,
  canReadCommunityPosts,
  findMembership,
} from "@/lib/server/communities-access";
import {
  countVerifiedQueenMothersForCommunity,
  listVerifiedQueenMothersForCommunity,
} from "@/lib/server/communities-verified";
import { listCommunityForums } from "@/lib/server/community-forums-public";
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
      region: { select: { name: true, slug: true } },
      coverMedia: { select: { storagePath: true, alt: true } },
      _count: { select: { memberships: true } },
    },
  });

  if (!c) notFound();

  const [verifiedQueenMotherCount, queenMotherProfiles] = await Promise.all([
    countVerifiedQueenMothersForCommunity(c.id),
    listVerifiedQueenMothersForCommunity(c.id),
  ]);

  const session = await getMemberSession();
  const membership = session ? await findMembership(c.id, session.memberId) : null;

  const showFullAbout = canReadCommunityFullDetail(c.visibility, membership);
  const showPosts = canReadCommunityPosts(c.visibility, membership);
  const posts = showPosts
    ? await listCommunityPostsVisibleToViewer(c.id, session?.memberId ?? null)
    : [];

  const showForumsList = showFullAbout || showPosts;
  const forums = showForumsList ? await listCommunityForums(c.id) : [];

  const memberAccountsEnabled = platformFeatures.authentication(getServerPlatformPhase());

  const headerDescription =
    c.traditionalAreaName ??
    (c.visibility === "MEMBERS_ONLY" ? "Members-only community on MBKRU" : undefined);

  return (
    <div>
      <PageHeader title={c.name} description={headerDescription} />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--foreground-secondary)]">
            <Link href="/communities" className={primaryNavLinkClass}>
              ← All communities
            </Link>
          </p>
          {c.coverMedia ? (
            <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--section-light)] shadow-sm">
              <Image
                src={c.coverMedia.storagePath}
                alt={c.coverMedia.alt || `${c.name} cover`}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
          ) : null}
          <div className="mt-6 rounded-2xl border border-[var(--accent-gold)]/30 bg-gradient-to-br from-[var(--accent-gold-light)] to-white px-5 py-4 text-sm leading-relaxed text-[var(--foreground-secondary)]">
            <p>
              <span className="font-semibold text-[var(--foreground)]">Queen Mothers &amp; council workspace</span> —
              independent civic space linked to traditional areas, not an official Traditional Council channel.
            </p>
            <p className="mt-2">
              Share concerns, post announcements, and discuss with council members in the focused portal.{" "}
              <Link href={`/communities/${encodeURIComponent(c.slug)}/portal`} className={`${primaryLinkClass} font-semibold`}>
                Open council workspace
              </Link>
            </p>
          </div>

          <CommunityOnlinePresence communitySlug={c.slug} />

          <dl className="mt-6 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground-secondary)]">
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
            {verifiedQueenMotherCount > 0 ? (
              <div>
                <dt className="inline font-medium text-[var(--foreground)]">Queen Mother: </dt>
                <dd className="inline">
                  <CommunityQueenMotherBadge count={verifiedQueenMotherCount} variant="inline" />
                </dd>
              </div>
            ) : null}
          </dl>

          <CommunityQueenMotherRoster profiles={queenMotherProfiles} />

          {c.region ? (
            <p className="mt-4 text-sm text-[var(--foreground-secondary)]">
              More traditional spaces in {c.region.name}:{" "}
              <Link
                href={communitiesBrowseHref({ region: c.region.slug, join: "open" })}
                className={primaryNavLinkClass}
              >
                Browse {c.region.name} communities →
              </Link>
            </p>
          ) : null}
          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">About</h2>
            {showFullAbout ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground-secondary)]">
                {c.description}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
                {c.visibility === "MEMBERS_ONLY"
                  ? "The full description is available to active members of this community. Use membership below to join or sign in."
                  : c.description}
              </p>
            )}
          </div>

          {forums.length > 0 ? (
            <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">Forums</h2>
                  <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                    Discussion spaces — open a forum for threads and replies. Moderators can add new forums.
                  </p>
                </div>
                <Link
                  href={`/communities/${encodeURIComponent(c.slug)}/forums`}
                  className={`${primaryNavLinkClass} text-xs font-semibold`}
                >
                  Manage and browse →
                </Link>
              </div>
              <ul className="mt-4 space-y-3">
                {forums.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/30 px-3 py-2.5 transition hover:border-[var(--primary)]/35"
                  >
                    <Link
                      href={`/communities/${encodeURIComponent(c.slug)}/forums/${encodeURIComponent(f.slug)}`}
                      className={`${primaryLinkClass} text-sm font-semibold`}
                    >
                      {f.name}
                    </Link>
                    {f.locked ? (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                        Locked
                      </span>
                    ) : null}
                    <p className="mt-1 text-[11px] text-[var(--foreground-secondary)]">
                      <span className="tabular-nums font-medium text-[var(--foreground)]">{f.publishedThreadCount}</span>{" "}
                      published thread{f.publishedThreadCount === 1 ? "" : "s"}
                      {f.lastActivityAt ? (
                        <>
                          {" "}
                          · last activity{" "}
                          <time dateTime={f.lastActivityAt.toISOString()}>
                            {f.lastActivityAt.toLocaleDateString(undefined, { dateStyle: "medium" })}
                          </time>
                        </>
                      ) : null}
                    </p>
                    {f.description ? (
                      <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{f.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div id="join" className="scroll-mt-24">
            <CommunityMemberPanel
              communitySlug={c.slug}
              joinPolicy={c.joinPolicy}
              visibility={c.visibility}
              restrictedDetail={!showFullAbout}
              memberAccountsEnabled={memberAccountsEnabled}
              postForumSlug="general"
              showThreadTitleField
            />
          </div>

          <section className="mt-10">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent threads</h2>
            <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
              Root posts across forums — pinned first, then by latest activity. Use a forum page for the full list in
              one space; open a thread for replies.
            </p>
            {!showPosts ? (
              <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
                Posts are visible to active members only.
              </p>
            ) : posts.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--foreground-secondary)]">No threads yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {posts.map((p) => (
                  <CommunityThreadCard
                    key={p.id}
                    communitySlug={c.slug}
                    post={p}
                    viewerMemberId={session?.memberId ?? null}
                    showForumBadge
                  />
                ))}
              </ul>
            )}
          </section>

          <p className="mt-10 text-center text-sm text-[var(--foreground-secondary)]">
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
