import Link from "next/link";

import {
  activateCommunityAction,
  createCommunityAction,
} from "@/app/admin/communities/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export default async function AdminCommunitiesPage() {
  await requireAdminSession();

  const [communities, regions] = await Promise.all([
    prisma.community.findMany({
      orderBy: [{ status: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { memberships: true, posts: true } },
      },
    }),
    prisma.region.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <AdminPageContainer width="narrow">
      <AdminPageHeader
        title="Communities"
        description={
          <>
            <p>
              Create spaces for traditional areas and Queen Mother networks. Only <strong>ACTIVE</strong> +{" "}
              <strong>PUBLIC</strong> communities appear on the public directory.
            </p>
            <p className="mt-2 text-sm">
              <Link href="/admin/community-reports" className={primaryLinkClass}>
                Open cross-community reports queue →
              </Link>
            </p>
            <p className="mt-1 text-sm">
              <Link href="/admin/community-verifications" className={primaryLinkClass}>
                Open community verification queue →
              </Link>
            </p>
          </>
        }
      />
      <p className="mt-1 text-sm">
        <Link href="/admin/communities/moderation" className={primaryLinkClass}>
          Global pending posts queue →
        </Link>
      </p>

      <section className="mt-10 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">New community</h2>
        <form action={createCommunityAction} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="slug" className="block text-xs font-medium text-[var(--foreground)]">
                Slug (URL)
              </label>
              <input
                id="slug"
                name="slug"
                required
                minLength={2}
                maxLength={80}
                placeholder="e.g. example-traditional-area"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-[var(--foreground)]">
                Display name
              </label>
              <input
                id="name"
                name="name"
                required
                minLength={2}
                maxLength={200}
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-xs font-medium text-[var(--foreground)]">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              minLength={1}
              maxLength={50000}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="traditionalAreaName" className="block text-xs font-medium text-[var(--foreground)]">
              Traditional area label <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <input
              id="traditionalAreaName"
              name="traditionalAreaName"
              maxLength={200}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="regionId" className="block text-xs font-medium text-[var(--foreground)]">
              Region <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <select
              id="regionId"
              name="regionId"
              defaultValue=""
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm sm:max-w-md"
            >
              <option value="">— None —</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="joinPolicy" className="block text-xs font-medium text-[var(--foreground)]">
                Join policy
              </label>
              <select
                id="joinPolicy"
                name="joinPolicy"
                defaultValue="OPEN"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              >
                <option value="OPEN">Open</option>
                <option value="APPROVAL_REQUIRED">Approval required</option>
              </select>
            </div>
            <div>
              <label htmlFor="visibility" className="block text-xs font-medium text-[var(--foreground)]">
                Visibility
              </label>
              <select
                id="visibility"
                name="visibility"
                defaultValue="PUBLIC"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              >
                <option value="PUBLIC">Public</option>
                <option value="MEMBERS_ONLY">Members only</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            New communities start as <strong>DRAFT</strong>. Open the row below and click <strong>Activate</strong> when
            ready for the public directory.
          </p>
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Create draft
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">All communities ({communities.length})</h2>
        {communities.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {communities.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <Link href={`/admin/communities/${c.id}`} className={primaryLinkClass}>
                    {c.name}
                  </Link>
                  <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">{c.slug}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {c.status} · {c.visibility} · {c.joinPolicy} · {c._count.memberships} members · {c._count.posts}{" "}
                    posts
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {c.status === "DRAFT" ? (
                    <form action={activateCommunityAction}>
                      <input type="hidden" name="communityId" value={c.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                      >
                        Activate
                      </button>
                    </form>
                  ) : null}
                  <Link
                    href={`/admin/communities/${c.id}`}
                    className="inline-flex items-center rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                  >
                    Manage
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPageContainer>
  );
}
