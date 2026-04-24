import Link from "next/link";

import {
  createTownHallEventAction,
} from "@/app/admin/town-halls/actions";
import { TownHallFormFields } from "@/app/admin/town-halls/TownHallFormFields";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { programmeEventKindLabel } from "@/lib/programme-event-labels";

export default async function AdminTownHallsPage() {
  await requireAdminSession();

  const [events, regions, constituencyRows] = await Promise.all([
    prisma.townHallEvent.findMany({
      orderBy: [{ sortOrder: "asc" }, { slug: "asc" }],
      include: {
        region: { select: { name: true } },
        constituency: { select: { name: true } },
      },
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

  const emptyDefaults = {
    slug: "",
    title: "",
    kind: "TOWN_HALL" as const,
    summary: "",
    programmeQuarter: "",
    venueLine: "",
    infoUrl: "",
    sourceCitation: "",
    sortOrder: 100,
    status: "TBC" as const,
    regionId: "",
    constituencyId: "",
    startsAt: "",
    endsAt: "",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Town halls &amp; forums</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Programme rows power the public{" "}
        <Link href="/town-halls" className={primaryLinkClass}>
          /town-halls
        </Link>{" "}
        page. Seed creates roadmap placeholders; edit here when dates and venues are confirmed. Provenance note:{" "}
        <code className="rounded bg-[var(--section-light)] px-1 text-xs">prisma/data/TOWN_HALL_SEED_SOURCES.txt</code>.
      </p>

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">New programme row</h2>
        <form action={createTownHallEventAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <TownHallFormFields regions={regions} constituencies={constituencies} defaults={emptyDefaults} />
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
            >
              Create
            </button>
          </div>
        </form>
      </section>

      <ul className="mt-10 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {events.length === 0 ? (
          <li className="p-6 text-sm text-[var(--muted-foreground)]">No rows yet — run seed or create above.</li>
        ) : (
          events.map((ev) => (
            <li key={ev.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--foreground)]">{ev.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  <code className="rounded bg-[var(--section-light)] px-1">{ev.slug}</code>
                  {" · "}
                  {programmeEventKindLabel(ev.kind)}
                  {" · "}
                  {ev.status}
                  {ev.constituency?.name ? ` · ${ev.constituency.name}` : null}
                  {ev.region?.name ? ` · ${ev.region.name}` : !ev.constituency ? " · National / multi-region" : null}
                  {ev.programmeQuarter ? ` · ${ev.programmeQuarter}` : null}
                </p>
              </div>
              <Link href={`/admin/town-halls/${ev.id}`} className={`${primaryNavLinkClass} shrink-0 text-sm font-semibold`}>
                Edit
              </Link>
            </li>
          ))
        )}
      </ul>

      <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className={primaryLinkClass}>
          ← Admin home
        </Link>
      </p>
    </div>
  );
}
