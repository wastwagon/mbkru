import Link from "next/link";
import { notFound } from "next/navigation";

import { updatePetitionStatusAction } from "@/app/admin/petitions/actions";
import {
  adminRemovePetitionPendingSignatureAction,
  adminRemovePetitionSignatureAction,
} from "@/app/admin/petitions/manage-signatures-actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

import type { PetitionStatus } from "@prisma/client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string; error?: string }>;
};

const STATUS_OPTIONS: { value: PetitionStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" },
];

export default async function AdminPetitionDetailPage({ params, searchParams }: Props) {
  await requireAdminSession();
  const { id } = await params;
  const sp = (await searchParams) ?? {};

  const petition = await prisma.petition.findUnique({
    where: { id },
    include: {
      author: { select: { email: true, displayName: true } },
      region: { select: { name: true } },
      signatures: {
        orderBy: { createdAt: "desc" },
        take: 500,
        select: {
          id: true,
          signerEmail: true,
          signerName: true,
          consentShowName: true,
          consentUpdates: true,
          memberId: true,
          createdAt: true,
        },
      },
      pendingSignatures: {
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          signerEmail: true,
          signerName: true,
          consentShowName: true,
          consentUpdates: true,
          expiresAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!petition) notFound();

  const exportHref = `/api/admin/petitions/${encodeURIComponent(petition.id)}/signatures-export`;

  return (
    <AdminPageContainer width="narrow">
      <AdminPageHeader
        showDashboardBack={false}
        title={petition.title}
        backSlot={
          <Link href="/admin/petitions" className={primaryLinkClass}>
            ← Petitions
          </Link>
        }
        description={
          <div className="space-y-1 text-sm">
            <p className="text-[var(--muted-foreground)]">
              Slug{" "}
              <Link href={`/petitions/${encodeURIComponent(petition.slug)}`} className={primaryLinkClass} target="_blank" rel="noopener noreferrer">
                /petitions/{petition.slug}
              </Link>
            </p>
            <p className="text-[var(--muted-foreground)]">
              Status: <span className="font-medium text-[var(--foreground)]">{petition.status}</span>
              {petition.region?.name ? ` · ${petition.region.name}` : ""}
            </p>
            <p className="text-[var(--muted-foreground)]">
              Author: {petition.author.displayName ?? petition.author.email}{" "}
              <span className="text-xs opacity-80">({petition.author.email})</span>
            </p>
          </div>
        }
      />

      {sp.saved === "1" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Petition status updated.
        </p>
      ) : null}
      {sp.saved === "removed-sig" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Confirmed signature removed.
        </p>
      ) : null}
      {sp.saved === "removed-pending" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Pending verification row removed.
        </p>
      ) : null}
      {sp.error === "sig" || sp.error === "pending" ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          That row could not be found — refresh and try again.
        </p>
      ) : null}

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Status</h2>
        <form action={updatePetitionStatusAction} className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={petition.id} />
          <input type="hidden" name="redirect" value="detail" />
          <label htmlFor="status" className="sr-only">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={petition.status}
            className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]">
            Save status
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Confirmed signatures ({petition.signatures.length})</h2>
          <a
            href={exportHref}
            className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-xs font-semibold text-[var(--foreground)] underline decoration-[var(--primary)] underline-offset-2 hover:bg-[var(--muted)]"
          >
            Download CSV
          </a>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Removing a signature is irreversible — use for fraud or duplicated emails after review.
        </p>
        {petition.signatures.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">None yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--border)] text-sm">
            {petition.signatures.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-[var(--muted-foreground)]">{s.signerEmail}</p>
                  {s.signerName ? <p className="text-[var(--foreground)]">{s.signerName}</p> : null}
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {s.createdAt.toLocaleString("en-GB")}
                    {s.memberId ? ` · member ${s.memberId.slice(0, 8)}…` : ""} · show name: {s.consentShowName ? "yes" : "no"}
                    {" · updates: "}
                    {s.consentUpdates ? "yes" : "no"}
                  </p>
                </div>
                <form action={adminRemovePetitionSignatureAction}>
                  <input type="hidden" name="petitionId" value={petition.id} />
                  <input type="hidden" name="signatureId" value={s.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-900 hover:bg-rose-100"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Pending email verification ({petition.pendingSignatures.length})</h2>
          <Link href="/admin/analytics/petition-pending" className={`text-xs font-semibold ${primaryLinkClass}`}>
            Aggregate pending analytics →
          </Link>
        </div>
        {petition.pendingSignatures.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">None.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--border)] text-sm">
            {petition.pendingSignatures.map((p) => (
              <li key={p.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-[var(--muted-foreground)]">{p.signerEmail}</p>
                  {p.signerName ? <p>{p.signerName}</p> : null}
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Created {p.createdAt.toLocaleString("en-GB")} · expires {p.expiresAt.toLocaleString("en-GB")}
                  </p>
                </div>
                <form action={adminRemovePetitionPendingSignatureAction}>
                  <input type="hidden" name="petitionId" value={petition.id} />
                  <input type="hidden" name="pendingId" value={p.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-950 hover:bg-amber-100"
                  >
                    Revoke invite
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Body</h2>
        <div className="mt-2 whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--section-light)]/40 p-4 text-sm text-[var(--foreground)]">
          {petition.body}
        </div>
      </section>
    </AdminPageContainer>
  );
}
