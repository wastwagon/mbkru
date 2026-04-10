import Link from "next/link";
import { notFound } from "next/navigation";

import { updateMemberIdentityVerificationAction } from "@/app/admin/members/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ id: string }> };

const STATUSES = ["UNVERIFIED", "PENDING_REVIEW", "VERIFIED", "REJECTED"] as const;

export default async function AdminMemberDetailPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      displayName: true,
      phone: true,
      createdAt: true,
      identityVerificationStatus: true,
      identityVerificationNote: true,
      identityVerifiedAt: true,
      identityReviewRequestedAt: true,
      identityReviewRequestMessage: true,
      region: { select: { name: true } },
    },
  });

  if (!member) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin/members" className="text-[var(--primary)] hover:underline">
          ← Members
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">Member identity</h1>
      <p className="mt-1 font-mono text-sm text-[var(--muted-foreground)]">{member.email}</p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        {member.displayName ? `${member.displayName} · ` : null}
        {member.region?.name ? `${member.region.name} · ` : null}
        {member.phone ? `Phone ${member.phone} · ` : null}
        Joined {member.createdAt.toLocaleString("en-GB")}
      </p>

      {member.identityReviewRequestedAt || member.identityReviewRequestMessage ? (
        <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/50 p-6">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Member review request</h2>
          {member.identityReviewRequestedAt ? (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Requested {member.identityReviewRequestedAt.toLocaleString("en-GB")}
            </p>
          ) : null}
          {member.identityReviewRequestMessage ? (
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-white p-3 text-xs text-[var(--foreground)]">
              {member.identityReviewRequestMessage}
            </pre>
          ) : (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">No message left with the request.</p>
          )}
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Verification status</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Staff-only notes below are not shown on the member&apos;s account page.
        </p>
        <form action={updateMemberIdentityVerificationAction} className="mt-4 space-y-4">
          <input type="hidden" name="memberId" value={member.id} />
          <div>
            <label htmlFor="identityVerificationStatus" className="block text-xs font-medium">
              Status
            </label>
            <select
              id="identityVerificationStatus"
              name="identityVerificationStatus"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              defaultValue={member.identityVerificationStatus}
              required
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="identityVerificationNote" className="block text-xs font-medium">
              Internal note <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <textarea
              id="identityVerificationNote"
              name="identityVerificationNote"
              rows={4}
              maxLength={10000}
              defaultValue={member.identityVerificationNote ?? ""}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Save
          </button>
        </form>
      </section>

      {member.identityVerifiedAt && member.identityVerificationStatus === "VERIFIED" ? (
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Verified timestamp: {member.identityVerifiedAt.toLocaleString("en-GB")}
        </p>
      ) : null}
    </div>
  );
}
