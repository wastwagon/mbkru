import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  approveCommunityMembershipLeadershipAction,
  publishCommunityPostLeadershipAction,
  rejectCommunityPostLeadershipAction,
  setCommunityMembershipRoleLeadershipAction,
  setCommunityMembershipStateLeadershipAction,
  updateCommunityPostReportStatusLeadershipAction,
} from "@/app/(main)/communities/[slug]/manage/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { communityMembershipRoleLabel } from "@/lib/communities/community-affairs-roles";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCommunitiesBrowseEnabled } from "@/lib/reports/accountability-pages";
import { requireCommunityLeadership } from "@/lib/server/require-community-leadership";
import { isCommunitySlug } from "@/lib/validation/communities";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug.trim().toLowerCase();
  if (!isCommunitySlug(slug) || !isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) {
    return { title: "Community management" };
  }
  const c = await prisma.community.findFirst({
    where: { slug, status: "ACTIVE" },
    select: { name: true },
  });
  return { title: c ? `${c.name} · Manage` : "Community management" };
}

export default async function CommunityManagePage({ params }: Props) {
  if (!isCommunitiesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const slug = (await params).slug.trim().toLowerCase();
  if (!isCommunitySlug(slug)) notFound();

  const leadership = await requireCommunityLeadership(slug, `/communities/${encodeURIComponent(slug)}/manage`);

  const community = await prisma.community.findUnique({
    where: { id: leadership.communityId },
    include: {
      memberships: {
        where: { state: "PENDING_JOIN" },
        orderBy: { createdAt: "asc" },
        include: { member: { select: { email: true, displayName: true } } },
      },
    },
  });
  if (!community || community.status !== "ACTIVE") notFound();

  const [activeMembers, bannedMembers, pendingPosts, openPostReports] = await Promise.all([
    prisma.communityMembership.findMany({
      where: { communityId: community.id, state: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      include: { member: { select: { email: true, displayName: true } } },
    }),
    prisma.communityMembership.findMany({
      where: { communityId: community.id, state: "BANNED" },
      orderBy: { updatedAt: "desc" },
      include: { member: { select: { email: true, displayName: true } } },
      take: 50,
    }),
    prisma.communityPost.findMany({
      where: { communityId: community.id, moderationStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { email: true, displayName: true } } },
    }),
    prisma.communityPostReport.findMany({
      where: { status: "OPEN", post: { communityId: community.id } },
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { email: true, displayName: true } },
        post: { select: { id: true, body: true, kind: true } },
      },
    }),
  ]);

  const portalPath = `/communities/${encodeURIComponent(community.slug)}/portal`;

  return (
    <div>
      <PageHeader
        title={`${community.name} — manage`}
        description="Approve members, moderate posts, and review reports for your community."
      />

      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--foreground-secondary)]">
            Signed in as <span className="font-medium text-[var(--foreground)]">{leadership.email}</span> ·{" "}
            {communityMembershipRoleLabel(leadership.role)}
          </p>
          <p className="mt-2 text-sm">
            <Link href={portalPath} className={primaryNavLinkClass}>
              Council workspace
            </Link>
            <span className="mx-2 text-[var(--foreground-secondary)]/50">·</span>
            <Link href={`/communities/${encodeURIComponent(community.slug)}`} className={primaryNavLinkClass}>
              Community overview
            </Link>
          </p>

          <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Pending join requests</h2>
            {community.memberships.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--foreground-secondary)]">None.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {community.memberships.map((m) => (
                  <li key={m.id} className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/40 p-4">
                    <p className="text-sm text-[var(--foreground)]">
                      {m.member.displayName ?? m.member.email}
                      <span className="ml-2 text-xs text-[var(--foreground-secondary)]">{m.member.email}</span>
                    </p>
                    <form action={approveCommunityMembershipLeadershipAction} className="mt-3">
                      <input type="hidden" name="communitySlug" value={community.slug} />
                      <input type="hidden" name="membershipId" value={m.id} />
                      <button
                        type="submit"
                        className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
                      >
                        Approve
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Active members</h2>
            {activeMembers.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--foreground-secondary)]">None yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {activeMembers.map((m) => (
                  <li key={m.id} className="rounded-xl border border-[var(--border)] p-4">
                    <p className="text-sm text-[var(--foreground)]">
                      {m.member.displayName ?? m.member.email}
                      <span className="ml-2 text-xs text-[var(--foreground-secondary)]">{m.member.email}</span>
                    </p>
                    <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                      {communityMembershipRoleLabel(m.role)}
                    </p>
                    {m.memberId !== leadership.memberId && m.role !== "QUEEN_MOTHER_VERIFIED" ? (
                      <form action={setCommunityMembershipRoleLeadershipAction} className="mt-3 flex flex-wrap items-end gap-2">
                        <input type="hidden" name="communitySlug" value={community.slug} />
                        <input type="hidden" name="membershipId" value={m.id} />
                        <label htmlFor={`role-${m.id}`} className="sr-only">
                          Role for {m.member.email}
                        </label>
                        <select
                          id={`role-${m.id}`}
                          name="role"
                          defaultValue={m.role === "MODERATOR" ? "MODERATOR" : "MEMBER"}
                          className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                        >
                          <option value="MEMBER">Member</option>
                          {leadership.role === "QUEEN_MOTHER_VERIFIED" ? (
                            <option value="MODERATOR">Moderator</option>
                          ) : null}
                        </select>
                        <button
                          type="submit"
                          className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium"
                        >
                          Update role
                        </button>
                      </form>
                    ) : null}
                    {m.memberId !== leadership.memberId ? (
                      <form action={setCommunityMembershipStateLeadershipAction} className="mt-3 flex flex-wrap gap-2">
                        <input type="hidden" name="communitySlug" value={community.slug} />
                        <input type="hidden" name="membershipId" value={m.id} />
                        <input type="hidden" name="state" value="BANNED" />
                        <input
                          name="banReason"
                          placeholder="Ban reason (optional)"
                          maxLength={2000}
                          className="min-w-[12rem] flex-1 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-900 hover:bg-rose-100"
                        >
                          Ban member
                        </button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Banned members</h2>
            {bannedMembers.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--foreground-secondary)]">None.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {bannedMembers.map((m) => (
                  <li key={m.id} className="rounded-xl border border-[var(--border)] p-4">
                    <p className="text-sm">{m.member.displayName ?? m.member.email}</p>
                    {m.banReason ? (
                      <p className="mt-2 text-xs text-[var(--foreground-secondary)]">{m.banReason}</p>
                    ) : null}
                    <form action={setCommunityMembershipStateLeadershipAction} className="mt-3">
                      <input type="hidden" name="communitySlug" value={community.slug} />
                      <input type="hidden" name="membershipId" value={m.id} />
                      <input type="hidden" name="state" value="ACTIVE" />
                      <button
                        type="submit"
                        className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium"
                      >
                        Unban
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Posts awaiting moderation</h2>
            {pendingPosts.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--foreground-secondary)]">None.</p>
            ) : (
              <ul className="mt-4 space-y-6">
                {pendingPosts.map((p) => (
                  <li key={p.id} className="rounded-xl border border-[var(--border)] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-secondary)]">
                      {p.kind} · {p.author.displayName ?? p.author.email}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{p.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={publishCommunityPostLeadershipAction}>
                        <input type="hidden" name="communitySlug" value={community.slug} />
                        <input type="hidden" name="postId" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
                        >
                          Publish
                        </button>
                      </form>
                      <form action={rejectCommunityPostLeadershipAction} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="communitySlug" value={community.slug} />
                        <input type="hidden" name="postId" value={p.id} />
                        <input
                          name="reason"
                          placeholder="Reason (optional)"
                          maxLength={2000}
                          className="min-w-[12rem] rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Open post reports</h2>
            {openPostReports.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--foreground-secondary)]">None.</p>
            ) : (
              <ul className="mt-4 space-y-5">
                {openPostReports.map((r) => (
                  <li key={r.id} className="rounded-xl border border-[var(--border)] p-4">
                    <p className="text-sm font-medium">Reason: {r.reason}</p>
                    <p className="mt-2 line-clamp-4 text-sm text-[var(--foreground-secondary)]">{r.post.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={updateCommunityPostReportStatusLeadershipAction}>
                        <input type="hidden" name="communitySlug" value={community.slug} />
                        <input type="hidden" name="reportId" value={r.id} />
                        <input type="hidden" name="status" value="REVIEWED" />
                        <button type="submit" className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                          Mark reviewed
                        </button>
                      </form>
                      <form action={updateCommunityPostReportStatusLeadershipAction}>
                        <input type="hidden" name="communitySlug" value={community.slug} />
                        <input type="hidden" name="reportId" value={r.id} />
                        <input type="hidden" name="status" value="DISMISSED" />
                        <button type="submit" className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm">
                          Dismiss
                        </button>
                      </form>
                      <Link
                        href={`/communities/${encodeURIComponent(community.slug)}/post/${r.post.id}`}
                        className={`${primaryLinkClass} self-center text-sm`}
                      >
                        View post →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
