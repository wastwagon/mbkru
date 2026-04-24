import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ReportCommunityPostButton } from "@/components/communities/ReportCommunityPostButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { canReadCommunityPosts, findMembership } from "@/lib/server/communities-access";
import { getCommunityPostForViewer } from "@/lib/server/community-posts-public";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
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

  const preview = post.body.slice(0, 140).replace(/\s+/g, " ").trim();
  return {
    title: `${c.name} · Post`,
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

  return (
    <div>
      <PageHeader title={c.name} description="Community post" />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <Link href={`/communities/${c.slug}`} className={primaryNavLinkClass}>
              ← Back to community
            </Link>
            <span className="text-[var(--muted-foreground)]/50" aria-hidden>
              ·
            </span>
            <Link href="/communities" className={primaryNavLinkClass}>
              All communities
            </Link>
          </p>

          <article className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <span className="font-medium uppercase tracking-wide text-[var(--foreground)]">{post.kind}</span>
              <span>·</span>
              <span>{post.author.displayName ?? "Member"}</span>
              <span>·</span>
              <time dateTime={post.createdAt.toISOString()}>
                {post.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </time>
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
        </div>
      </section>
    </div>
  );
}
