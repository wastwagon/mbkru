import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CommunityPostKind } from "@prisma/client";

import { CommunityMemberPanel } from "@/components/communities/CommunityMemberPanel";
import { CommunityThreadCard } from "@/components/communities/CommunityThreadCard";
import { CommunityOnlinePresence } from "@/components/member/CommunityOnlinePresence";
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
import { findCommunityForumBySlug } from "@/lib/server/community-forums-public";
import { listCommunityPostsVisibleToViewer } from "@/lib/server/community-posts-public";
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

const KIND_SECTION: Record<
  CommunityPostKind,
  { title: string; description: string }
> = {
  CONCERN: {
    title: "Concerns",
    description:
      "Raise issues for your traditional area — visible to members and moderators. Threads may be reviewed before publication.",
  },
  ANNOUNCEMENT: {
    title: "Announcements",
    description:
      "Official notices from verified Queen Mothers and moderators. Council members can reply in each thread.",
  },
  GENERAL: {
    title: "Council discussion",
    description:
      "Open conversation between Queen Mothers, council representatives, and members with access to this community.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug.trim().toLowerCase();
  if (!isCommunitySlug(slug) || !isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) {
    return { title: "Council workspace" };
  }
  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { name: true },
  });
  return {
    title: c ? `${c.name} · Council workspace` : "Council workspace",
    description:
      "Queen Mothers and traditional council members — share concerns, announcements, and discussion in one place.",
  };
}

export default async function CommunityCouncilPortalPage({ params }: Props) {
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

  const generalForum = await findCommunityForumBySlug(c.id, "general");
  const forumScope = generalForum ? { forumId: generalForum.id } : {};

  const viewerId = session?.memberId ?? null;

  const concerns = showPosts
    ? await listCommunityPostsVisibleToViewer(c.id, viewerId, {
        ...forumScope,
        kinds: ["CONCERN"],
      })
    : [];

  const announcements = showPosts
    ? await listCommunityPostsVisibleToViewer(c.id, viewerId, {
        ...forumScope,
        kinds: ["ANNOUNCEMENT"],
      })
    : [];

  const discussions = showPosts
    ? await listCommunityPostsVisibleToViewer(c.id, viewerId, {
        ...forumScope,
        kinds: ["GENERAL"],
      })
    : [];

  const memberAccountsEnabled = platformFeatures.authentication(getServerPlatformPhase());

  const portalPath = `/communities/${encodeURIComponent(c.slug)}/portal`;

  return (
    <div>
      <PageHeader
        title={`${c.name} — council workspace`}
        description={
          c.traditionalAreaName ??
          "A focused space for Queen Mothers and traditional council members to share concerns, post announcements, and discuss together."
        }
      />

      <nav
        className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80"
        aria-label="Council workspace sections"
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 text-sm sm:px-6 lg:px-8">
          <Link href="#post-and-membership" className={`${primaryNavLinkClass} font-medium`}>
            Post &amp; membership
          </Link>
          <span className="text-[var(--muted-foreground)]/40" aria-hidden>
            ·
          </span>
          <Link href="#concerns" className={`${primaryNavLinkClass} font-medium`}>
            Concerns
          </Link>
          <span className="text-[var(--muted-foreground)]/40" aria-hidden>
            ·
          </span>
          <Link href="#announcements" className={`${primaryNavLinkClass} font-medium`}>
            Announcements
          </Link>
          <span className="text-[var(--muted-foreground)]/40" aria-hidden>
            ·
          </span>
          <Link href="#discussion" className={`${primaryNavLinkClass} font-medium`}>
            Discussion
          </Link>
          <span className="ml-auto text-xs text-[var(--muted-foreground)]">
            <Link href={`/communities/${encodeURIComponent(c.slug)}`} className={primaryNavLinkClass}>
              Community overview →
            </Link>
          </span>
        </div>
      </nav>

      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/communities" className={primaryNavLinkClass}>
              ← All communities
            </Link>
          </p>

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-semibold text-[var(--foreground)]">How this workspace fits together</h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              <li>
                <strong className="text-[var(--foreground)]">Concerns</strong> — structured threads for issues Queen Mothers and
                members want leadership to see.
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Announcements</strong> — for verified Queen Mothers (traditional
                leadership voice) and programme moderators (published immediately when your role allows).
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Council discussion</strong> — everyday dialogue with traditional
                council members and others who join this community.
              </li>
            </ul>
            {c.region ? (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                Region: <span className="font-medium text-[var(--foreground)]">{c.region.name}</span> ·{" "}
                <span className="tabular-nums">{c._count.memberships}</span> member
                {c._count.memberships === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>

          <CommunityOnlinePresence communitySlug={c.slug} />

          <section id="post-and-membership" className="scroll-mt-24">
            <CommunityMemberPanel
              communitySlug={c.slug}
              joinPolicy={c.joinPolicy}
              visibility={c.visibility}
              restrictedDetail={!showFullAbout}
              memberAccountsEnabled={memberAccountsEnabled}
              postForumSlug="general"
              showThreadTitleField
              signInReturnPath={portalPath}
            />
          </section>

          <PortalFeedSection
            id="concerns"
            kind="CONCERN"
            showPosts={showPosts}
            posts={concerns}
            communitySlug={c.slug}
            viewerMemberId={viewerId}
          />

          <PortalFeedSection
            id="announcements"
            kind="ANNOUNCEMENT"
            showPosts={showPosts}
            posts={announcements}
            communitySlug={c.slug}
            viewerMemberId={viewerId}
          />

          <PortalFeedSection
            id="discussion"
            kind="GENERAL"
            showPosts={showPosts}
            posts={discussions}
            communitySlug={c.slug}
            viewerMemberId={viewerId}
          />

          <p className="mt-12 text-center text-sm text-[var(--muted-foreground)]">
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

function PortalFeedSection({
  id,
  kind,
  showPosts,
  posts,
  communitySlug,
  viewerMemberId,
}: {
  id: string;
  kind: CommunityPostKind;
  showPosts: boolean;
  posts: Awaited<ReturnType<typeof listCommunityPostsVisibleToViewer>>;
  communitySlug: string;
  viewerMemberId: string | null;
}) {
  const meta = KIND_SECTION[kind];

  return (
    <section id={id} className="mt-14 scroll-mt-24">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{meta.title}</h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{meta.description}</p>
      {!showPosts ? (
        <p className="mt-4 rounded-xl border border-[var(--border)] bg-white px-4 py-6 text-sm text-[var(--muted-foreground)]">
          Sign in and join this community to view and participate in these threads.
        </p>
      ) : posts.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-white/80 px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
          No threads in this section yet — use <strong className="text-[var(--foreground)]">Post &amp; membership</strong>{" "}
          above to start one ({kind.toLowerCase()}).
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {posts.map((p) => (
            <CommunityThreadCard
              key={p.id}
              communitySlug={communitySlug}
              post={p}
              viewerMemberId={viewerMemberId}
              showForumBadge={false}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
