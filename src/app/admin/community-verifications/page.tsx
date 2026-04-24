import Image from "next/image";
import Link from "next/link";

import { reviewCommunityVerificationAction } from "@/app/admin/communities/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export default async function AdminCommunityVerificationsPage() {
  await requireAdminSession();

  const [pending, recent] = await Promise.all([
    prisma.communityVerificationRequest.findMany({
      where: { status: "SUBMITTED" },
      orderBy: { createdAt: "asc" },
      include: {
        member: { select: { email: true, displayName: true } },
        community: { select: { id: true, slug: true, name: true } },
      },
      take: 200,
    }),
    prisma.communityVerificationRequest.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { reviewedAt: "desc" },
      include: {
        member: { select: { email: true, displayName: true } },
        community: { select: { id: true, name: true } },
      },
      take: 80,
    }),
  ]);
  const pendingDocIds = Array.from(
    new Set(
      pending.flatMap((r) =>
        Array.isArray(r.documentMediaIds)
          ? r.documentMediaIds.filter((v): v is string => typeof v === "string")
          : [],
      ),
    ),
  );
  const mediaById = new Map(
    (
      await prisma.media.findMany({
        where: { id: { in: pendingDocIds } },
        select: { id: true, filename: true, storagePath: true, mimeType: true },
      })
    ).map((m) => [m.id, m]),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className={primaryLinkClass}>
          ← Admin
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">Community verifications</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Review identity/traditional role verification requests from community members.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Pending requests ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">No pending requests.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((r) => (
              <li key={r.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-sm text-[var(--foreground)]">
                  <span className="font-medium">{r.member.displayName ?? r.member.email}</span>
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">{r.member.email}</span>
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {r.community.name} · submitted{" "}
                  {r.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })} · documents:{" "}
                  {Array.isArray(r.documentMediaIds) ? r.documentMediaIds.length : 0}
                </p>
                {Array.isArray(r.documentMediaIds) && r.documentMediaIds.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {r.documentMediaIds
                      .filter((v): v is string => typeof v === "string")
                      .map((docId) => {
                        const media = mediaById.get(docId);
                        const canPreview = !!media && media.mimeType.startsWith("image/");
                        return (
                          <li
                            key={`${r.id}-${docId}`}
                            className="rounded-lg border border-[var(--border)] bg-[var(--section-light)]/40 p-2"
                          >
                            <div className="flex items-start gap-3">
                              {canPreview ? (
                                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-[var(--border)] bg-white">
                                  <Image
                                    src={media.storagePath}
                                    alt={media.filename}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : null}
                              <div className="min-w-0">
                                <p className="truncate font-mono text-[10px] text-[var(--muted-foreground)]">{docId}</p>
                                {media ? (
                                  <a
                                    href={media.storagePath}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`${primaryLinkClass} mt-0.5 inline-block text-xs`}
                                  >
                                    {media.filename}
                                  </a>
                                ) : (
                                  <p className="mt-0.5 text-xs text-amber-700">Media not found</p>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                ) : null}
                {r.reviewNotes ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">{r.reviewNotes}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Link href={`/admin/communities/${r.community.id}`} className={primaryLinkClass}>
                    Open community admin
                  </Link>
                  <Link href={`/communities/${r.community.slug}`} className={primaryLinkClass}>
                    Public community page
                  </Link>
                  <a
                    href={`/api/admin/community-verifications/${r.id}/document-manifest`}
                    className={primaryLinkClass}
                  >
                    Download document manifest (CSV)
                  </a>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <form action={reviewCommunityVerificationAction} className="rounded-lg border border-[var(--border)] p-3">
                    <input type="hidden" name="requestId" value={r.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <label htmlFor={`approve-notes-${r.id}`} className="block text-xs font-medium text-[var(--foreground)]">
                      Reviewer notes (optional)
                    </label>
                    <textarea
                      id={`approve-notes-${r.id}`}
                      name="notes"
                      maxLength={2000}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      className="mt-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--primary-dark)]"
                    >
                      Approve & verify role
                    </button>
                  </form>

                  <form action={reviewCommunityVerificationAction} className="rounded-lg border border-[var(--border)] p-3">
                    <input type="hidden" name="requestId" value={r.id} />
                    <input type="hidden" name="status" value="REJECTED" />
                    <label htmlFor={`reject-notes-${r.id}`} className="block text-xs font-medium text-[var(--foreground)]">
                      Rejection reason
                    </label>
                    <textarea
                      id={`reject-notes-${r.id}`}
                      name="notes"
                      maxLength={2000}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-1 text-sm"
                    />
                    <button
                      type="submit"
                      className="mt-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)]"
                    >
                      Reject request
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Recently reviewed</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              >
                <p className="text-[var(--foreground)]">
                  <span className="font-medium">{r.community.name}</span> · {r.member.displayName ?? r.member.email} ·{" "}
                  {r.status.toLowerCase()}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {r.reviewedAt
                    ? r.reviewedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })
                    : r.updatedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
