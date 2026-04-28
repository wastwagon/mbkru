import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CommunityReplyForm } from "@/components/communities/CommunityReplyForm";
import { ReportCommunityPostButton } from "@/components/communities/ReportCommunityPostButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import { canReadCommunityPosts, findMembership } from "@/lib/server/communities-access";
import {
  getCommunityPostForViewer,
  listCommunityPostRepliesVisibleToViewer,
} from "@/lib/server/community-posts-public";
import { isThreadActivityBumped } from "@/lib/community-thread-ui";
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string; postId: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug, postId } = await params;
  const slug = rawSlug.trim().toLowerCase();
  if (!isCommunitySlug(slug) || !isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) {
    return { title: "Community post" };
  }

  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true, name: true, visibility: true },
  });
  if (!c) return { title: "Community post" };

  const session = await getMemberSession();
  const membership = session ? await findMembership(c.id, session.memberId) : null;
  if (!canReadCommunityPosts(c.visibility, membership)) {
    return { title: c.name };
  }

  const post = await getCommunityPostForViewer(c.id, postId, session?.memberId ?? null);
  if (!post) return { title: c.name };

  const preview = (post.title ?? post.body).slice(0, 140).replace(/\s+/g, " ").trim();
  return {
    title: post.title ? `${post.title} · ${c.name}` : `${c.name} · Post`,
    description: preview.length ? preview : undefined,
  };
}

export default async function CommunityPostDetailPage({ params }: Props) {
  if (!isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const { slug: rawSlug, postId } = await params;
  const slug = rawSlug.trim().toLowerCase();
  if (!isCommunitySlug(slug)) notFound();

  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true, name: true, slug: true, visibility: true },
  });
  if (!c) notFound();

  const session = await getMemberSession();
  const membership = session ? await findMembership(c.id, session.memberId) : null;

  if (!canReadCommunityPosts(c.visibility, membership)) notFound();

  const post = await getCommunityPostForViewer(c.id, postId, session?.memberId ?? null);
  if (!post) notFound();

  const memberAccountsEnabled = platformFeatures.authentication(getServerPlatformPhase());

  const replies =
    post.parentPostId === null
      ? await listCommunityPostRepliesVisibleToViewer(c.id, post.id, session?.memberId ?? null)
      : [];

  const canReplySafe =
    Boolean(memberAccountsEnabled) &&
    membership?.state === "ACTIVE" &&
    post.parentPostId === null;

  const threadDescription =
    post.parentPostId !== null
      ? "Reply in a community thread"
      : post._count.replies === 0
        ? "Community thread — no published replies yet"
        : `Community thread · ${post._count.replies} published repl${post._count.replies === 1 ? "y" : "ies"}`;

  const rootBumped = post.parentPostId === null && isThreadActivityBumped(post.createdAt, post.lastActivityAt);

  return (
    <div>
      <PageHeader title={post.title ?? c.name} description={threadDescription} />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <Link href={`/communities/${c.slug}`} className={primaryNavLinkClass}>
              ← Back to community
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            {post.communityForum ? (
              <>
                <Link
                  href={`/communities/${c.slug}/forums/${post.communityForum.slug}`}
                  className={primaryNavLinkClass}
                >
                  Forum: {post.communityForum.name}
                </Link>
                <span className="text-[var(--muted-foreground)]/50" aria-hidden>
                  ·
                </span>
              </>
            ) : null}
            <Link href="/communities" className={primaryNavLinkClass}>
              All communities
            </Link>
          </p>

          {post.parentPostId ? (
            <p className="mt-6 text-sm text-[var(--muted-foreground)]">
              This message is a <strong>reply</strong>.{" "}
              <Link href={`/communities/${c.slug}/post/${post.parentPostId}`} className={primaryNavLinkClass}>
                View the full thread
              </Link>
              .
            </p>
          ) : null}

          <article className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <span className="font-medium uppercase tracking-wide text-[var(--foreground)]">{post.kind}</span>
              <span>·</span>
              <span>{post.author.displayName ?? "Member"}</span>
              <span>·</span>
              <span>Started</span>{" "}
              <time dateTime={post.createdAt.toISOString()}>
                {post.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </time>
              {rootBumped ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-medium text-sky-900">
                    Last activity{" "}
                    <time dateTime={post.lastActivityAt.toISOString()}>
                      {post.lastActivityAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </time>
                  </span>
                </>
              ) : null}
              {post.moderationStatus !== "PUBLISHED" ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                  {post.moderationStatus.toLowerCase()}
                </span>
              ) : null}
              {post.pinned ? (
                <span className="rounded-full bg-[var(--section-light)] px-2 py-0.5 text-[10px] font-semibold uppercase">
                  Pinned
                </span>
              ) : null}
            </div>
            {post.title ? (
              <h1 className="mt-4 font-display text-xl font-bold text-[var(--foreground)] sm:text-2xl">{post.title}</h1>
            ) : null}
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">{post.body}</p>
            {memberAccountsEnabled ? (
              <ReportCommunityPostButton
                communitySlug={c.slug}
                postId={post.id}
                authorMemberId={post.author.id}
                viewerMemberId={session?.memberId ?? null}
              />
            ) : null}
          </article>

          {post.parentPostId === null && replies.length > 0 ? (
            <section className="mt-10" aria-label="Replies">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Replies ({replies.length})</h2>
              <ul className="mt-4 space-y-4">
                {replies.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <span className="font-medium uppercase tracking-wide text-[var(--foreground)]">{r.kind}</span>
                      <span>·</span>
                      <span>{r.author.displayName ?? "Member"}</span>
                      <span>·</span>
                      <time dateTime={r.createdAt.toISOString()}>
                        {r.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </time>
                      {r.moderationStatus !== "PUBLISHED" ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                          {r.moderationStatus.toLowerCase()}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--foreground)]">{r.body}</p>
                    <p className="mt-2 text-xs">
                      <Link href={`/communities/${c.slug}/post/${r.id}`} className={primaryNavLinkClass}>
                        Permalink
                      </Link>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {canReplySafe && post.parentPostId === null ? (
            <CommunityReplyForm communitySlug={c.slug} rootPostId={post.id} />
          ) : null}
        </div>
      </section>
    </div>
  );
}
