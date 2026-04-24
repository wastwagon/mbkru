import Link from "next/link";

import { updateCommunityPostReportStatusFromQueueAction } from "@/app/admin/communities/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export default async function AdminCommunityReportsPage() {
  await requireAdminSession();

  const [openReports, recentClosed] = await Promise.all([
    prisma.communityPostReport.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "asc" },
      include: {
        reporter: { select: { id: true, displayName: true } },
        post: {
          select: {
            id: true,
            body: true,
            authorMemberId: true,
            community: { select: { id: true, slug: true, name: true } },
          },
        },
      },
      take: 200,
    }),
    prisma.communityPostReport.findMany({
      where: { status: { in: ["REVIEWED", "DISMISSED"] } },
      orderBy: { reviewedAt: "desc" },
      include: {
        reporter: { select: { id: true, displayName: true } },
        post: {
          select: {
            id: true,
            community: { select: { id: true, slug: true, name: true } },
          },
        },
      },
      take: 80,
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className={primaryLinkClass}>
          ← Admin
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">Community post reports</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Review reports from all communities in one queue. Open reports are shown oldest-first.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Open reports ({openReports.length})</h2>
        {openReports.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">No open reports.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {openReports.map((r) => (
              <li key={r.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{r.post.community.name}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Reported by {r.reporter.displayName || "Anonymous member"} ·{" "}
                      {r.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={updateCommunityPostReportStatusFromQueueAction}>
                      <input type="hidden" name="reportId" value={r.id} />
                      <input type="hidden" name="status" value="REVIEWED" />
                      <button
                        type="submit"
                        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]"
                      >
                        Mark reviewed
                      </button>
                    </form>
                    <form action={updateCommunityPostReportStatusFromQueueAction}>
                      <input type="hidden" name="reportId" value={r.id} />
                      <input type="hidden" name="status" value="DISMISSED" />
                      <button
                        type="submit"
                        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]"
                      >
                        Dismiss
                      </button>
                    </form>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[var(--foreground)]">{r.reason}</p>
                <p className="mt-3 rounded-lg bg-[var(--section-light)] p-3 text-xs text-[var(--muted-foreground)]">
                  {r.post.body}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <Link href={`/communities/${r.post.community.slug}`} className={primaryLinkClass}>
                    Public page
                  </Link>
                  <Link href={`/admin/communities/${r.post.community.id}`} className={primaryLinkClass}>
                    Community moderation
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Recently closed</h2>
        {recentClosed.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">No reviewed or dismissed reports yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recentClosed.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              >
                <p className="text-[var(--foreground)]">
                  <span className="font-medium">{r.post.community.name}</span> · {r.status.toLowerCase()} ·{" "}
                  {r.reason.slice(0, 80)}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {r.reviewedAt
                    ? r.reviewedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })
                    : r.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
