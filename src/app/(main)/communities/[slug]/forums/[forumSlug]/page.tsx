import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CommunityMemberPanel } from "@/components/communities/CommunityMemberPanel";
import { CommunityThreadCard } from "@/components/communities/CommunityThreadCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import {
  canReadCommunityFullDetail,
  canReadCommunityPosts,
  findMembership,
} from "@/lib/server/communities-access";
import { findCommunityForumBySlug } from "@/lib/server/community-forums-public";
import { listCommunityPostsVisibleToViewer } from "@/lib/server/community-posts-public";
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string; forumSlug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw, forumSlug: rawForum } = await params;
  const slug = raw.trim().toLowerCase();
  const forumSlug = rawForum.trim().toLowerCase();
  if (!isCommunitySlug(slug) || !isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) {
    return { title: "Forum" };
  }
  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true, name: true },
  });
  if (!c) return { title: "Forum" };
  const forum = await findCommunityForumBySlug(c.id, forumSlug);
  return { title: forum ? `${c.name} · ${forum.name}` : c.name };
}

export default async function CommunityForumDetailPage({ params }: Props) {
  if (!isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const { slug: raw, forumSlug: rawForum } = await params;
  const slug = raw.trim().toLowerCase();
  const forumSlug = rawForum.trim().toLowerCase();
  if (!isCommunitySlug(slug)) notFound();

  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true, slug: true, name: true, visibility: true, joinPolicy: true },
  });
  if (!c) notFound();

  const forum = await findCommunityForumBySlug(c.id, forumSlug);
  if (!forum) notFound();

  const session = await getMemberSession();
  const membership = session ? await findMembership(c.id, session.memberId) : null;
  const showPosts = canReadCommunityPosts(c.visibility, membership);
  const showFullAbout = canReadCommunityFullDetail(c.visibility, membership);
  if (!showPosts && !showFullAbout) notFound();

  const posts = showPosts
    ? await listCommunityPostsVisibleToViewer(c.id, session?.memberId ?? null, { forumId: forum.id })
    : [];

  const memberAccountsEnabled = platformFeatures.authentication(getServerPlatformPhase());

  return (
    <div>
      <PageHeader
        title={forum.name}
        description={forum.locked ? "This forum is locked to new threads unless you are a moderator." : c.name}
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href={`/communities/${encodeURIComponent(c.slug)}/forums`} className={primaryNavLinkClass}>
              ← All forums
            </Link>
            <span className="mx-2 text-[var(--muted-foreground)]/50">·</span>
            <Link href={`/communities/${encodeURIComponent(c.slug)}`} className={primaryNavLinkClass}>
              Community home
            </Link>
          </p>

          {forum.description ? (
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted-foreground)]">
              {forum.description}
            </p>
          ) : null}

          <CommunityMemberPanel
            communitySlug={c.slug}
            joinPolicy={c.joinPolicy}
            visibility={c.visibility}
            restrictedDetail={!showFullAbout}
            memberAccountsEnabled={memberAccountsEnabled}
            postForumSlug={forum.slug}
            showThreadTitleField
          />

          <section className="mt-10">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Threads</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Pinned first, then most recently active (new replies bump a thread).
            </p>
            {!showPosts ? (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Members only.</p>
            ) : posts.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">No threads in this forum yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {posts.map((p) => (
                  <CommunityThreadCard
                    key={p.id}
                    communitySlug={c.slug}
                    post={p}
                    viewerMemberId={session?.memberId ?? null}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
