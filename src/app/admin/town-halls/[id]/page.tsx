import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteTownHallEventAction, updateTownHallEventAction } from "@/app/admin/town-halls/actions";
import { formatLocalDateTimeInput, TownHallFormFields } from "@/app/admin/town-halls/TownHallFormFields";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminTownHallEditPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const [ev, regions, constituencyRows] = await Promise.all([
    prisma.townHallEvent.findUnique({
      where: { id },
      include: { region: { select: { name: true } }, constituency: { select: { name: true } } },
    }),
    prisma.region.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.constituency.findMany({
      orderBy: [{ region: { sortOrder: "asc" } }, { name: "asc" }],
      select: { id: true, name: true, region: { select: { name: true } } },
    }),
  ]);

  const constituencies = constituencyRows.map((c) => ({
    id: c.id,
    name: c.name,
    regionName: c.region.name,
  }));

  if (!ev) notFound();

  const defaults = {
    id: ev.id,
    slug: ev.slug,
    title: ev.title,
    kind: ev.kind,
    summary: ev.summary ?? "",
    programmeQuarter: ev.programmeQuarter ?? "",
    venueLine: ev.venueLine ?? "",
    infoUrl: ev.infoUrl ?? "",
    sourceCitation: ev.sourceCitation ?? "",
    sortOrder: ev.sortOrder,
    status: ev.status,
    regionId: ev.regionId ?? "",
    constituencyId: ev.constituencyId ?? "",
    startsAt: formatLocalDateTimeInput(ev.startsAt),
    endsAt: formatLocalDateTimeInput(ev.endsAt),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin/town-halls" className="text-[var(--primary)] hover:underline">
          ← Town halls
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">Edit programme row</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        <code className="rounded bg-[var(--section-light)] px-1 text-xs">{ev.slug}</code>
        {ev.region?.name ? ` · ${ev.region.name}` : null}
      </p>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6">
        <form action={updateTownHallEventAction} className="grid gap-4 sm:grid-cols-2">
          <TownHallFormFields regions={regions} constituencies={constituencies} defaults={defaults} />
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
            >
              Save changes
            </button>
            <Link
              href="/town-halls"
              className="inline-flex items-center rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--section-light)]"
            >
              View public page
            </Link>
          </div>
        </form>
      </section>

      <section className="mt-8 rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="text-sm font-semibold text-red-900">Delete</h2>
        <p className="mt-1 text-sm text-red-800/90">Removes this row from the public programme list. This cannot be undone.</p>
        <form action={deleteTownHallEventAction} className="mt-4">
          <input type="hidden" name="id" value={ev.id} />
          <button
            type="submit"
            className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
          >
            Delete row
          </button>
        </form>
      </section>
    </div>
  );
}
