import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CommunityForumCreateForm } from "@/components/communities/CommunityForumCreateForm";
import { PageHeader } from "@/components/ui/PageHeader";
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
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug.trim().toLowerCase();
  if (!isCommunitySlug(slug) || !isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) {
    return { title: "Forums" };
  }
  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { name: true },
  });
  return { title: c ? `${c.name} · Forums` : "Forums" };
}

export default async function CommunityForumsIndexPage({ params }: Props) {
  if (!isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const slug = (await params).slug.trim().toLowerCase();
  if (!isCommunitySlug(slug)) notFound();

  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { id: true, slug: true, name: true, visibility: true },
  });
  if (!c) notFound();

  const session = await getMemberSession();
  const membership = session ? await findMembership(c.id, session.memberId) : null;
  const showPosts = canReadCommunityPosts(c.visibility, membership);
  const showFullAbout = canReadCommunityFullDetail(c.visibility, membership);
  if (!showPosts && !showFullAbout) notFound();

  const forums = await listCommunityForums(c.id);
  const canManageForum =
    membership?.state === "ACTIVE" &&
    (membership.role === "MODERATOR" || membership.role === "QUEEN_MOTHER_VERIFIED");

  return (
    <div>
      <PageHeader title={`${c.name} · Forums`} description="Discussion spaces for this community." />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href={`/communities/${encodeURIComponent(c.slug)}`} className={primaryNavLinkClass}>
              ← Back to community
            </Link>
            <span className="mx-2 text-[var(--muted-foreground)]/50">·</span>
            <Link href="/communities" className={primaryNavLinkClass}>
              All communities
            </Link>
          </p>

          {forums.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--muted-foreground)]">No forums yet. Run database migrations and seed, or ask an operator.</p>
          ) : (
            <ul className="mt-8 space-y-3">
              {forums.map((f) => (
                <li key={f.id} className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                  <Link
                    href={`/communities/${encodeURIComponent(c.slug)}/forums/${encodeURIComponent(f.slug)}`}
                    className={`${primaryLinkClass} text-base font-semibold`}
                  >
                    {f.name}
                  </Link>
                  {f.locked ? (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                      Locked
                    </span>
                  ) : null}
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    <span className="tabular-nums font-semibold text-[var(--foreground)]">{f.publishedThreadCount}</span>{" "}
                    published thread{f.publishedThreadCount === 1 ? "" : "s"}
                    {f.lastActivityAt ? (
                      <>
                        {" "}
                        · last activity{" "}
                        <time dateTime={f.lastActivityAt.toISOString()}>
                          {f.lastActivityAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </time>
                      </>
                    ) : null}
                  </p>
                  {f.description ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">{f.description}</p> : null}
                  <p className="mt-2 font-mono text-[11px] text-[var(--muted-foreground)]">/{f.slug}</p>
                </li>
              ))}
            </ul>
          )}

          {canManageForum ? <CommunityForumCreateForm communitySlug={c.slug} /> : null}
        </div>
      </section>
    </div>
  );
}
