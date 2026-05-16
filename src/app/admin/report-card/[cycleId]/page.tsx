import Link from "next/link";
import { notFound } from "next/navigation";

import { updateReportCardCycleDisputeWindowAction, upsertScorecardEntryAction } from "@/app/admin/report-card/actions";
import { formatUtcForDatetimeLocalInput } from "@/lib/admin/report-operations-datetime";
import { MetricsDisplay } from "@/components/accountability/MetricsDisplay";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { reportCardPublicVersusStoredLabel } from "@/lib/report-card-public-label";

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

  const { publicTitle, storedLabel, showStoredLine } = reportCardPublicVersusStoredLabel(cycle.year, cycle.label);

  const members = await prisma.parliamentMember.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <AdminPageContainer width="narrow">
      <AdminPageHeader
        showDashboardBack={false}
        title={`${cycle.year} — ${publicTitle}`}
        backSlot={
          <Link href="/admin/report-card" className={primaryLinkClass}>
            ← Report card cycles
          </Link>
        }
      />
      <div className="mt-2 space-y-1">
        {showStoredLine ? (
          <p className="text-xs text-[var(--muted-foreground)]">
            Stored label (database):{" "}
            <span className="font-mono text-[var(--foreground)]">{storedLabel.length > 0 ? storedLabel : "(empty)"}</span>
          </p>
        ) : null}
        {cycle.publishedAt ? (
          <p className="text-xs text-green-700">Published {cycle.publishedAt.toLocaleString("en-GB")}</p>
        ) : (
          <p className="text-xs text-amber-700">Draft — not visible on public report card</p>
        )}
      </div>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Dispute window</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Optional end datetime (UTC) for a published correction / dispute period — shown on the public cycle page when
          set. Clear the field and save to remove.
        </p>
        <form action={updateReportCardCycleDisputeWindowAction} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="cycleId" value={cycle.id} />
          <div>
            <label htmlFor="disputeWindowEndsAt" className="block text-xs font-medium">
              Dispute window ends (UTC)
            </label>
            <input
              id="disputeWindowEndsAt"
              name="disputeWindowEndsAt"
              type="datetime-local"
              defaultValue={cycle.disputeWindowEndsAt ? formatUtcForDatetimeLocalInput(cycle.disputeWindowEndsAt) : ""}
              className="mt-1 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
          >
            Save dispute window
          </button>
        </form>
      </section>

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add or update entry</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Same member + cycle updates the existing row. Index A/B/C are the Ghana triple ledger (0–100 each). Checking
          &quot;Set headline from triple&quot; overwrites the overall score with 0.5·A + 0.35·B + 0.15·C when all three
          are filled. Metrics remain optional structured JSON.
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
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="indexAScore" className="block text-xs font-medium">
                Index A (0–100)
              </label>
              <input
                id="indexAScore"
                name="indexAScore"
                type="text"
                inputMode="decimal"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="indexBScore" className="block text-xs font-medium">
                Index B (0–100)
              </label>
              <input
                id="indexBScore"
                name="indexBScore"
                type="text"
                inputMode="decimal"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="indexCScore" className="block text-xs font-medium">
                Index C (0–100)
              </label>
              <input
                id="indexCScore"
                name="indexCScore"
                type="text"
                inputMode="decimal"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="overallScore" className="block text-xs font-medium">
              Headline score <span className="font-normal text-[var(--muted-foreground)]">(optional, e.g. 72.5)</span>
            </label>
            <input
              id="overallScore"
              name="overallScore"
              type="text"
              inputMode="decimal"
              className="mt-1 w-full max-w-xs rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input id="syncHeadlineFromTriple" name="syncHeadlineFromTriple" type="checkbox" value="1" className="h-4 w-4 rounded border-[var(--border)]" />
            <label htmlFor="syncHeadlineFromTriple" className="text-xs text-[var(--foreground)]">
              Set headline from triple (requires A, B, and C)
            </label>
          </div>
          <div>
            <label htmlFor="metrics" className="block text-xs font-medium">
              Metrics <span className="font-normal text-[var(--muted-foreground)]">(optional JSON object)</span>
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
          <ul className="mt-4 space-y-6">
            {cycle.entries.map((e) => (
              <li key={e.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="font-medium text-[var(--foreground)]">{e.member.name}</p>
                {e.overallScore != null ? (
                  <p className="mt-1 text-sm text-[var(--primary)]">Headline score: {e.overallScore}</p>
                ) : null}
                {e.indexAScore != null || e.indexBScore != null || e.indexCScore != null ? (
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Triple: A {e.indexAScore ?? "—"} · B {e.indexBScore ?? "—"} · C {e.indexCScore ?? "—"}
                  </p>
                ) : null}
                {e.narrative ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">{e.narrative}</p>
                ) : null}
                {e.metrics != null ? (
                  <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--section-light)]/60 p-3">
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">Metrics (read-only)</p>
                    <div className="mt-2">
                      <MetricsDisplay value={e.metrics} />
                    </div>
                  </div>
                ) : null}

                <details className="mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--section-light)]/30 p-3">
                  <summary className="cursor-pointer text-sm font-medium text-[var(--primary)]">Edit entry</summary>
                  <form action={upsertScorecardEntryAction} className="mt-3 space-y-3">
                    <input type="hidden" name="cycleId" value={cycle.id} />
                    <input type="hidden" name="memberId" value={e.memberId} />
                    <div>
                      <label className="block text-xs font-medium" htmlFor={`narr-${e.id}`}>
                        Narrative
                      </label>
                      <textarea
                        id={`narr-${e.id}`}
                        name="narrative"
                        rows={4}
                        maxLength={100000}
                        defaultValue={e.narrative ?? ""}
                        className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-medium" htmlFor={`idxA-${e.id}`}>
                          Index A
                        </label>
                        <input
                          id={`idxA-${e.id}`}
                          name="indexAScore"
                          type="text"
                          inputMode="decimal"
                          defaultValue={e.indexAScore != null ? String(e.indexAScore) : ""}
                          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium" htmlFor={`idxB-${e.id}`}>
                          Index B
                        </label>
                        <input
                          id={`idxB-${e.id}`}
                          name="indexBScore"
                          type="text"
                          inputMode="decimal"
                          defaultValue={e.indexBScore != null ? String(e.indexBScore) : ""}
                          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium" htmlFor={`idxC-${e.id}`}>
                          Index C
                        </label>
                        <input
                          id={`idxC-${e.id}`}
                          name="indexCScore"
                          type="text"
                          inputMode="decimal"
                          defaultValue={e.indexCScore != null ? String(e.indexCScore) : ""}
                          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium" htmlFor={`score-${e.id}`}>
                        Headline score <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
                      </label>
                      <input
                        id={`score-${e.id}`}
                        name="overallScore"
                        type="text"
                        inputMode="decimal"
                        defaultValue={e.overallScore != null ? String(e.overallScore) : ""}
                        className="mt-1 w-full max-w-xs rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id={`sync-${e.id}`}
                        name="syncHeadlineFromTriple"
                        type="checkbox"
                        value="1"
                        className="h-4 w-4 rounded border-[var(--border)]"
                      />
                      <label htmlFor={`sync-${e.id}`} className="text-xs text-[var(--foreground)]">
                        Set headline from triple
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium" htmlFor={`met-${e.id}`}>
                        Metrics JSON <span className="font-normal text-[var(--muted-foreground)]">(optional object)</span>
                      </label>
                      <textarea
                        id={`met-${e.id}`}
                        name="metrics"
                        rows={4}
                        placeholder='{"attendance": 0.8}'
                        defaultValue={e.metrics == null ? "" : JSON.stringify(e.metrics, null, 2)}
                        className="mt-1 w-full font-mono text-xs rounded-xl border border-[var(--border)] px-3 py-2"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
                    >
                      Save changes
                    </button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPageContainer>
  );
}
