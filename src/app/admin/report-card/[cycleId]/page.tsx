import Link from "next/link";
import { notFound } from "next/navigation";

import { upsertScorecardEntryAction } from "@/app/admin/report-card/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ cycleId: string }> };

export default async function AdminReportCardCyclePage({ params }: Props) {
  await requireAdminSession();
  const { cycleId } = await params;

  const cycle = await prisma.reportCardCycle.findUnique({
    where: { id: cycleId },
    include: {
      entries: {
        orderBy: { member: { name: "asc" } },
        include: { member: { select: { name: true, slug: true } } },
      },
    },
  });

  if (!cycle) notFound();

  const members = await prisma.parliamentMember.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin/report-card" className="text-[var(--primary)] hover:underline">
          ← Report card cycles
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">
        {cycle.year} — {cycle.label}
      </h1>
      {cycle.publishedAt ? (
        <p className="mt-1 text-xs text-green-700">Published {cycle.publishedAt.toLocaleString("en-GB")}</p>
      ) : (
        <p className="mt-1 text-xs text-amber-700">Draft — not visible on public report card</p>
      )}

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add or update entry</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Same member + cycle updates the existing row. Metrics must be valid JSON object or array (optional).
        </p>
        <form action={upsertScorecardEntryAction} className="mt-4 space-y-3">
          <input type="hidden" name="cycleId" value={cycle.id} />
          <div>
            <label htmlFor="memberId" className="block text-xs font-medium">
              Parliament member
            </label>
            <select
              id="memberId"
              name="memberId"
              required
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="">— Select —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.slug})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="narrative" className="block text-xs font-medium">
              Narrative
            </label>
            <textarea
              id="narrative"
              name="narrative"
              rows={4}
              maxLength={100000}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="overallScore" className="block text-xs font-medium">
              Overall score <span className="font-normal text-[var(--muted-foreground)]">(optional, e.g. 72.5)</span>
            </label>
            <input
              id="overallScore"
              name="overallScore"
              type="text"
              inputMode="decimal"
              className="mt-1 w-full max-w-xs rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="metrics" className="block text-xs font-medium">
              Metrics JSON <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <textarea
              id="metrics"
              name="metrics"
              rows={3}
              placeholder='{"attendance": 0.8, "responsiveness": 0.7}'
              className="mt-1 w-full font-mono text-xs rounded-xl border border-[var(--border)] px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Save entry
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Entries</h2>
        {cycle.entries.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">None yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {cycle.entries.map((e) => (
              <li key={e.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="font-medium text-[var(--foreground)]">{e.member.name}</p>
                {e.overallScore != null ? (
                  <p className="mt-1 text-sm text-[var(--primary)]">Score: {e.overallScore}</p>
                ) : null}
                {e.narrative ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">{e.narrative}</p>
                ) : null}
                {e.metrics != null ? (
                  <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-[var(--section-light)] p-2 text-[11px]">
                    {JSON.stringify(e.metrics, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
