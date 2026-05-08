import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";

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

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add region</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Use sparingly — Ghana normally ships sixteen seeded rows.</p>
        <form action={createRegionAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="new-name" className="block text-xs font-medium">
              Name
            </label>
            <input
              id="new-name"
              name="name"
              required
              maxLength={120}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="new-slug" className="block text-xs font-medium">
              Slug
            </label>
            <input
              id="new-slug"
              name="slug"
              required
              maxLength={80}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              placeholder="western-north"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 font-mono text-sm"
            />
          </div>
          <div>
            <label htmlFor="new-order" className="block text-xs font-medium">
              Sort order <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <input
              id="new-order"
              name="sortOrder"
              type="number"
              min={0}
              max={9999}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
            >
              Create region
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">All regions</h2>
        {regions.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">No regions — run migrations and seed.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {regions.map((r) => (
              <li key={r.id} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <form action={updateRegionAction} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={r.id} />
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium" htmlFor={`name-${r.id}`}>
                      Name
                    </label>
                    <input
                      id={`name-${r.id}`}
                      name="name"
                      required
                      defaultValue={r.name}
                      maxLength={120}
                      className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium" htmlFor={`slug-${r.id}`}>
                      Slug
                    </label>
                    <input
                      id={`slug-${r.id}`}
                      name="slug"
                      required
                      defaultValue={r.slug}
                      maxLength={80}
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium" htmlFor={`order-${r.id}`}>
                      Sort order
                    </label>
                    <input
                      id={`order-${r.id}`}
                      name="sortOrder"
                      type="number"
                      min={0}
                      max={9999}
                      required
                      defaultValue={r.sortOrder}
                      className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
                    <button
                      type="submit"
                      className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                    >
                      Save
                    </button>
                  </div>
                </form>
                <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">id: {r.id}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPageContainer>
  );
}
