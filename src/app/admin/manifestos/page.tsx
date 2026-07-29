import Link from "next/link";

import { createManifestoDocumentAction } from "@/app/admin/manifestos/actions";
import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
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

      <section id="add-manifesto" className="mt-2 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add manifesto</h2>
        <form action={createManifestoDocumentAction} className="mt-4 space-y-3">
          <FormField label="Title" htmlFor="title">
            <Input id="title" name="title" required minLength={2} maxLength={500} density="admin" />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Party slug" htmlFor="partySlug">
              <Input
                id="partySlug"
                name="partySlug"
                required
                maxLength={120}
                placeholder="e.g. ndc"
                density="admin"
              />
            </FormField>
            <FormField label="Election cycle" htmlFor="electionCycle">
              <Input
                id="electionCycle"
                name="electionCycle"
                required
                maxLength={32}
                placeholder="e.g. 2024"
                density="admin"
              />
            </FormField>
          </div>
          <FormField label="Source URL" htmlFor="sourceUrl">
            <Input id="sourceUrl" name="sourceUrl" type="url" required maxLength={4000} density="admin" />
          </FormField>
          <FormField label="Published date" htmlFor="publishedAt" optional>
            <Input id="publishedAt" name="publishedAt" type="date" density="admin" className="sm:max-w-xs" />
          </FormField>
          <FormField label="Notes" htmlFor="notes" optional>
            <Textarea id="notes" name="notes" rows={3} maxLength={20000} density="admin" />
          </FormField>
          <Button type="submit" density="admin">
            Save manifesto
          </Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Registered ({manifestos.length})</h2>
        {manifestos.length === 0 ? (
          <AdminEmptyState
            className="mt-2"
            title="No manifestos yet"
            message="Register a manifesto document using the form above."
            action={{ href: "#add-manifesto", label: "Add manifesto" }}
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {manifestos.map((m) => (
              <li key={m.id} className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm">
                <p className="font-medium text-[var(--foreground)]">{m.title}</p>
                <p className="mt-1 text-[var(--foreground-secondary)]">
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
