import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/communities" className={primaryNavLinkClass}>
              ← All communities
            </Link>
          </p>
          <p className="mt-6 rounded-2xl border border-[var(--primary)]/25 bg-gradient-to-br from-[var(--primary)]/10 to-white px-5 py-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">Queen Mothers &amp; council workspace</span> — share
            concerns, post announcements, and discuss with traditional council members in one focused portal.{" "}
            <Link href={`/communities/${encodeURIComponent(c.slug)}/portal`} className={`${primaryLinkClass} font-semibold`}>
              Open council workspace →
            </Link>
          </p>

          <CommunityOnlinePresence communitySlug={c.slug} />

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

          {forums.length > 0 ? (
            <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">Forums</h2>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
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
                  <li key={f.id} className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/30 px-3 py-2.5">
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
                    <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
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
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{f.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <CommunityMemberPanel
            communitySlug={c.slug}
            joinPolicy={c.joinPolicy}
            visibility={c.visibility}
            restrictedDetail={!showFullAbout}
            memberAccountsEnabled={memberAccountsEnabled}
            postForumSlug="general"
            showThreadTitleField
          />

          <section className="mt-10">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent threads</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Root posts across forums — pinned first, then by latest activity. Use a forum page for the full list in
              one space; open a thread for replies.
            </p>
            {!showPosts ? (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Posts are visible to active members only.
              </p>
            ) : posts.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">No threads yet.</p>
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
