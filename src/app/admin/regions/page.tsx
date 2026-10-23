import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

import { createRegionAction, updateRegionAction } from "./actions";

export default async function AdminRegionsPage() {
  await requireAdminSession();

  const regions = await prisma.region.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <AdminPageContainer width="narrow">
      <AdminPageHeader
        title="Regions"
        description="Reference geography for petitions, Voice reports, communities, and town halls. Changing a slug breaks deep links that embed the old value."
      />

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add region</h2>
        <p className="mt-1 text-xs text-[var(--foreground-secondary)]">Use sparingly — Ghana normally ships sixteen seeded rows.</p>
        <form action={createRegionAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <FormField label="Name" htmlFor="new-name" className="sm:col-span-2">
            <Input id="new-name" name="name" required maxLength={120} density="admin" />
          </FormField>
          <FormField label="Slug" htmlFor="new-slug">
            <Input
              id="new-slug"
              name="slug"
              required
              maxLength={80}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="western-north"
              density="admin"
              className="font-mono"
            />
          </FormField>
          <FormField label="Sort order" htmlFor="new-order" optional>
            <Input id="new-order" name="sortOrder" type="number" min={0} max={9999} density="admin" />
          </FormField>
          <div className="sm:col-span-2">
            <Button type="submit" density="admin">
              Create region
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">All regions</h2>
        {regions.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--foreground-secondary)]">No regions — run migrations and seed.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {regions.map((r) => (
              <li key={r.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <form action={updateRegionAction} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={r.id} />
                  <FormField label="Name" htmlFor={`name-${r.id}`} className="sm:col-span-2">
                    <Input
                      id={`name-${r.id}`}
                      name="name"
                      required
                      defaultValue={r.name}
                      maxLength={120}
                      density="admin"
                    />
                  </FormField>
                  <FormField label="Slug" htmlFor={`slug-${r.id}`}>
                    <Input
                      id={`slug-${r.id}`}
                      name="slug"
                      required
                      defaultValue={r.slug}
                      maxLength={80}
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      density="admin"
                      className="font-mono"
                    />
                  </FormField>
                  <FormField label="Sort order" htmlFor={`order-${r.id}`}>
                    <Input
                      id={`order-${r.id}`}
                      name="sortOrder"
                      type="number"
                      min={0}
                      max={9999}
                      required
                      defaultValue={r.sortOrder}
                      density="admin"
                    />
                  </FormField>
                  <div className="sm:col-span-2 flex flex-wrap items-center justify-end gap-3">
                    <Link href={`/admin/regions/${r.id}/gallery`} className={`text-sm font-medium ${primaryLinkClass}`}>
                      Header photo &amp; sector gallery →
                    </Link>
                    <Button type="submit" variant="surface" density="admin">
                      Save
                    </Button>
                  </div>
                </form>
                <p className="mt-2 font-mono text-xs text-[var(--foreground-secondary)]">id: {r.id}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPageContainer>
  );
}
