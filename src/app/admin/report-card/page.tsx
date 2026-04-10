import Link from "next/link";

import {
  createReportCardCycleAction,
  publishReportCardCycleAction,
  unpublishReportCardCycleAction,
} from "@/app/admin/report-card/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

export default async function AdminReportCardPage() {
  await requireAdminSession();

  const cycles = await prisma.reportCardCycle.findMany({
    orderBy: { year: "desc" },
    include: { _count: { select: { entries: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">People&apos;s Report Card</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Create a cycle per year, add scorecard rows per MP/minister, then publish when ready.         Public site shows only published cycles (Phase 2+ build with public report card enabled). Partner read API:{" "}
        <code className="rounded bg-[var(--section-light)] px-1 text-xs">GET /api/report-card/[year]</code>.
      </p>

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">New cycle</h2>
        <form action={createReportCardCycleAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="year" className="block text-xs font-medium">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              required
              min={1992}
              max={2100}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="label" className="block text-xs font-medium">
              Label
            </label>
            <input
              id="label"
              name="label"
              required
              maxLength={200}
              placeholder="e.g. 2026 mid-term snapshot"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="methodology" className="block text-xs font-medium">
              Methodology notes <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <textarea
              id="methodology"
              name="methodology"
              rows={3}
              maxLength={100000}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
            >
              Create cycle
            </button>
          </div>
        </form>
      </section>

      <ul className="mt-10 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {cycles.length === 0 ? (
          <li className="p-6 text-sm text-[var(--muted-foreground)]">No cycles yet.</li>
        ) : (
          cycles.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--foreground)]">
                  {c.year} — {c.label}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {c._count.entries} entr{c._count.entries === 1 ? "y" : "ies"}
                  {c.publishedAt ? (
                    <>
                      {" "}
                      · <span className="text-green-700">Published</span>{" "}
                      {c.publishedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                    </>
                  ) : (
                    <> · <span className="text-amber-700">Draft</span></>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/report-card/${c.id}`}
                  className="text-sm font-semibold text-[var(--primary)] hover:underline"
                >
                  Edit entries
                </Link>
                {c.publishedAt ? (
                  <form action={unpublishReportCardCycleAction}>
                    <input type="hidden" name="cycleId" value={c.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--section-light)]"
                    >
                      Unpublish
                    </button>
                  </form>
                ) : (
                  <form action={publishReportCardCycleAction}>
                    <input type="hidden" name="cycleId" value={c.id} />
                    <button
                      type="submit"
                      className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
                    >
                      Publish
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      <p className="mt-8">
        <Link href="/admin" className="text-sm text-[var(--primary)] hover:underline">
          ← Dashboard
        </Link>
      </p>
    </div>
  );
}
