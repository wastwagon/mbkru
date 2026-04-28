import Link from "next/link";
import { notFound } from "next/navigation";

import {
  approveCommunityMembershipAction,
  publishCommunityPostAction,
  rejectCommunityPostAction,
  setCommunityMembershipRoleAction,
  setCommunityMembershipStateAction,
  updateCommunityPostReportStatusAction,
} from "@/app/admin/communities/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCommunityDetailPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const community = await prisma.community.findUnique({
    where: { id },
    include: {
      region: { select: { name: true } },
      memberships: {
        where: { state: "PENDING_JOIN" },
        orderBy: { createdAt: "asc" },
        include: { member: { select: { email: true, displayName: true } } },
      },
    },
  });

  if (!community) notFound();

  const pendingPosts = await prisma.communityPost.findMany({
    where: { communityId: id, moderationStatus: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { email: true, displayName: true } } },
  });

  const activeMembers = await prisma.communityMembership.findMany({
    where: { communityId: id, state: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    include: { member: { select: { email: true, displayName: true } } },
  });
  const bannedMembers = await prisma.communityMembership.findMany({
    where: { communityId: id, state: "BANNED" },
    orderBy: { updatedAt: "desc" },
    include: { member: { select: { email: true, displayName: true } } },
    take: 100,
  });

  const openPostReports = await prisma.communityPostReport.findMany({
    where: { status: "OPEN", post: { communityId: id } },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { email: true, displayName: true } },
      post: { select: { id: true, body: true, kind: true } },
    },
  });

  const closedPostReports = await prisma.communityPostReport.findMany({
    where: {
      status: { in: ["REVIEWED", "DISMISSED"] },
      post: { communityId: id },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      status: true,
      reason: true,
      createdAt: true,
      reviewedAt: true,
      reporter: { select: { email: true, displayName: true } },
      post: { select: { body: true, kind: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin/communities" className={primaryLinkClass}>
          ← Communities
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">{community.name}</h1>
      <p className="mt-1 font-mono text-sm text-[var(--muted-foreground)]">{community.slug}</p>
      <dl className="mt-3 grid gap-1 text-sm text-[var(--muted-foreground)]">
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Status: </dt>
          <dd className="inline">{community.status}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Visibility: </dt>
          <dd className="inline">{community.visibility}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Join: </dt>
          <dd className="inline">{community.joinPolicy}</dd>
        </div>
        {community.region ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Region: </dt>
            <dd className="inline">{community.region.name}</dd>
          </div>
        ) : null}
      </dl>

      {community.status === "ACTIVE" ? (
        <p className="mt-4 text-sm">
          <Link href={`/communities/${community.slug}`} className={primaryLinkClass}>
            View live community page →
          </Link>
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Open post reports</h2>
        {openPostReports.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None.</p>
        ) : (
          <ul className="mt-4 space-y-5">
            {openPostReports.map((r) => (
              <li id={`mod-report-${r.id}`} key={r.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  Reporter: {r.reporter.displayName ?? r.reporter.email}
                  <span className="ml-2 font-normal normal-case text-[var(--muted-foreground)]">{r.reporter.email}</span>
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--foreground)]">Reason: {r.reason}</p>
                {r.details ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">{r.details}</p>
                ) : null}
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Post ({r.post.kind}) · {r.createdAt.toLocaleString()}
                </p>
                <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-[var(--foreground)]">{r.post.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={updateCommunityPostReportStatusAction}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="communityId" value={community.id} />
                    <input type="hidden" name="status" value="REVIEWED" />
                    <button
                      type="submit"
                      className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
                    >
                      Mark reviewed
                    </button>
                  </form>
                  <form action={updateCommunityPostReportStatusAction}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <input type="hidden" name="communityId" value={community.id} />
                    <input type="hidden" name="status" value="DISMISSED" />
                    <button
                      type="submit"
                      className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent closed post reports</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Last 25 marked reviewed or dismissed (new reports can be filed after closure).
        </p>
        {closedPostReports.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {closedPostReports.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--section-light)]/40 p-3 text-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {r.status}
                  {r.reviewedAt
                    ? ` · closed ${r.reviewedAt.toLocaleString()}`
                    : ` · filed ${r.createdAt.toLocaleString()}`}
                </p>
                <p className="mt-1 text-[var(--foreground)]">
                  {r.reporter.displayName ?? r.reporter.email}{" "}
                  <span className="text-xs text-[var(--muted-foreground)]">{r.reporter.email}</span>
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Reason: {r.reason}</p>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--muted-foreground)]">
                  Post ({r.post.kind}): {r.post.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Active members &amp; roles</h2>
        {activeMembers.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {activeMembers.map((m) => (
              <li key={m.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-sm text-[var(--foreground)]">
                  {m.member.displayName ?? m.member.email}
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">{m.member.email}</span>
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Current role: {m.role}</p>
                <form action={setCommunityMembershipRoleAction} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="membershipId" value={m.id} />
                  <input type="hidden" name="communityId" value={community.id} />
                  <label htmlFor={`role-${m.id}`} className="sr-only">
                    Role for {m.member.email}
                  </label>
                  <select
                    id={`role-${m.id}`}
                    name="role"
                    defaultValue={m.role}
                    className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="QUEEN_MOTHER_VERIFIED">Queen Mother (verified)</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                  >
                    Update role
                  </button>
                </form>
                <form action={setCommunityMembershipStateAction} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="membershipId" value={m.id} />
                  <input type="hidden" name="communityId" value={community.id} />
                  <input type="hidden" name="state" value="BANNED" />
                  <input
                    name="banReason"
                    placeholder="Ban reason (optional)"
                    maxLength={2000}
                    className="min-w-[12rem] rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-900 hover:bg-rose-100"
                  >
                    Ban member
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Banned members</h2>
        {bannedMembers.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {bannedMembers.map((m) => (
              <li key={m.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-sm text-[var(--foreground)]">
                  {m.member.displayName ?? m.member.email}
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">{m.member.email}</span>
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Banned {m.bannedAt ? m.bannedAt.toLocaleString() : m.updatedAt.toLocaleString()}
                </p>
                {m.banReason ? (
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-[var(--section-light)] p-3 text-xs text-[var(--foreground)]">
                    {m.banReason}
                  </p>
                ) : null}
                <form action={setCommunityMembershipStateAction} className="mt-3">
                  <input type="hidden" name="membershipId" value={m.id} />
                  <input type="hidden" name="communityId" value={community.id} />
                  <input type="hidden" name="state" value="ACTIVE" />
                  <button
                    type="submit"
                    className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                  >
                    Unban (set active)
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Pending join requests</h2>
        {community.memberships.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {community.memberships.map((m) => (
              <li key={m.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-sm text-[var(--foreground)]">
                  {m.member.displayName ?? m.member.email}
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">{m.member.email}</span>
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Since {m.createdAt.toLocaleString()}</p>
                <form action={approveCommunityMembershipAction} className="mt-3">
                  <input type="hidden" name="membershipId" value={m.id} />
                  <input type="hidden" name="communityId" value={community.id} />
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

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Posts awaiting moderation</h2>
        {pendingPosts.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {pendingPosts.map((p) => (
              <li id={`mod-post-${p.id}`} key={p.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                  {p.kind} · {p.author.displayName ?? p.author.email}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">{p.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={publishCommunityPostAction}>
                    <input type="hidden" name="postId" value={p.id} />
                    <input type="hidden" name="communityId" value={community.id} />
                    <button
                      type="submit"
                      className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
                    >
                      Publish
                    </button>
                  </form>
                  <form action={rejectCommunityPostAction} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="postId" value={p.id} />
                    <input type="hidden" name="communityId" value={community.id} />
                    <input
                      name="reason"
                      placeholder="Reason (optional)"
                      maxLength={2000}
                      className="min-w-[12rem] rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
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
    </div>
  );
}
