import Link from "next/link";

import { createManifestoDocumentAction } from "@/app/admin/manifestos/actions";
import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export default async function AdminManifestosPage() {
  await requireAdminSession();

  const manifestos = await prisma.manifestoDocument.findMany({
    orderBy: [{ electionCycle: "desc" }, { partySlug: "asc" }],
  });

  return (
    <AdminPageContainer width="form">
      <AdminPageHeader
        title="Manifesto registry"
        description={
          <>
            {accountabilityProse.adminManifestosIntro}{" "}
            <Link href="/api/manifestos" className={primaryLinkClass}>
              /api/manifestos
            </Link>
            .
          </>
        }
      />

      <section className="mt-2 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add manifesto</h2>
        <form action={createManifestoDocumentAction} className="mt-4 space-y-3">
          <div>
            <label htmlFor="title" className="block text-xs font-medium text-[var(--foreground)]">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              minLength={2}
              maxLength={500}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="partySlug" className="block text-xs font-medium text-[var(--foreground)]">
                Party slug
              </label>
              <input
                id="partySlug"
                name="partySlug"
                required
                maxLength={120}
                placeholder="e.g. ndc"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="electionCycle" className="block text-xs font-medium text-[var(--foreground)]">
                Election cycle
              </label>
              <input
                id="electionCycle"
                name="electionCycle"
                required
                maxLength={32}
                placeholder="e.g. 2024"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="sourceUrl" className="block text-xs font-medium text-[var(--foreground)]">
              Source URL
            </label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              required
              maxLength={4000}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="publishedAt" className="block text-xs font-medium text-[var(--foreground)]">
              Published date <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="date"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm sm:max-w-xs"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-xs font-medium text-[var(--foreground)]">
              Notes <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={20000}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Save manifesto
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Registered ({manifestos.length})</h2>
        {manifestos.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {manifestos.map((m) => (
              <li key={m.id} className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm">
                <p className="font-medium text-[var(--foreground)]">{m.title}</p>
                <p className="mt-1 text-[var(--muted-foreground)]">
                  <span className="font-mono">{m.partySlug}</span> · {m.electionCycle}
                </p>
                <a
                  href={m.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${primaryLinkClass} mt-2 inline-block`}
                >
                  Source link
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPageContainer>
  );
}
