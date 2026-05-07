import {
  processNotificationQueueAction,
  resetStuckProcessingJobsAction,
  retryNotificationJobAction,
} from "@/app/admin/notifications/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";

type Props = {
  searchParams?: Promise<{ processed?: string; retried?: string; reset?: string }>;
};

export default async function AdminNotificationsPage({ searchParams }: Props) {
  await requireAdminSession();
  const sp = (await searchParams) ?? {};

  const [statusCounts, pending, failed] = await Promise.all([
    prisma.notificationDeliveryJob.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.notificationDeliveryJob.findMany({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
      orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
      take: 80,
    }),
    prisma.notificationDeliveryJob.findMany({
      where: { status: "FAILED" },
      orderBy: { updatedAt: "desc" },
      take: 80,
    }),
  ]);
  // eslint-disable-next-line react-hooks/purity -- server component; request-scoped clock for stale-job detection
  const processingStaleBefore = new Date(Date.now() - 10 * 60_000);
  const stuckProcessingCount = await prisma.notificationDeliveryJob.count({
    where: { status: "PROCESSING", updatedAt: { lt: processingStaleBefore } },
  });

  const counts = new Map(statusCounts.map((x) => [x.status, x._count._all]));

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Notification outbox"
        description="Queued delivery jobs for report emails and SMS. Review counts, run the processor, and retry failures safely."
      />
      {sp.processed === "1" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-900">
          Queue processing completed.
        </p>
      ) : null}
      {sp.retried === "1" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-900">
          Failed job moved back to pending.
        </p>
      ) : null}
      {sp.reset === "1" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-900">
          Stuck processing jobs reset for retry.
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["PENDING", "PROCESSING", "SENT", "FAILED"] as const).map((status) => (
          <AdminMetricCard key={status} label={status} value={counts.get(status) ?? 0} />
        ))}
      </div>
      {stuckProcessingCount > 0 ? (
        <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p>{stuckProcessingCount} job(s) have been in PROCESSING for over 10 minutes.</p>
          <form action={resetStuckProcessingJobsAction} className="mt-2">
            <button
              type="submit"
              className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-100"
            >
              Reset stuck jobs
            </button>
          </form>
        </div>
      ) : null}

      <form action={processNotificationQueueAction} className="mt-6 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-4">
        <label htmlFor="limit" className="text-sm text-[var(--foreground)]">
          Process up to
        </label>
        <input
          id="limit"
          name="limit"
          type="number"
          min={1}
          max={100}
          defaultValue={20}
          className="w-24 rounded-lg border border-[var(--border)] px-2 py-1 text-sm"
        />
        <span className="text-sm text-[var(--muted-foreground)]">jobs now</span>
        <button
          type="submit"
          className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
        >
          Run processor
        </button>
      </form>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Pending / processing</h2>
        <ul className="mt-3 space-y-2">
          {pending.length === 0 ? (
            <li className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--muted-foreground)]">
              No pending jobs.
            </li>
          ) : (
            pending.map((job) => (
              <li key={job.id} className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm">
                <p className="font-mono text-[11px] text-[var(--muted-foreground)]">{job.id}</p>
                <p className="text-[var(--foreground)]">
                  {job.channel} · {job.kind} · {job.status}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  attempts {job.attempts}/{job.maxAttempts} · available {job.availableAt.toISOString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent failed</h2>
        <ul className="mt-3 space-y-2">
          {failed.length === 0 ? (
            <li className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--muted-foreground)]">
              No failed jobs.
            </li>
          ) : (
            failed.map((job) => (
              <li key={job.id} className="rounded-lg border border-amber-300 bg-amber-50/40 px-3 py-2 text-sm">
                <p className="font-mono text-[11px] text-amber-900/80">{job.id}</p>
                <p className="text-amber-950">
                  {job.channel} · {job.kind} · {job.status}
                </p>
                <p className="text-xs text-amber-900/80">
                  attempts {job.attempts}/{job.maxAttempts} · last error: {job.lastError ?? "unknown"}
                </p>
                <form action={retryNotificationJobAction} className="mt-2">
                  <input type="hidden" name="id" value={job.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-amber-400 bg-white px-2 py-1 text-xs font-semibold hover:bg-amber-100"
                  >
                    Retry this job
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>
    </AdminPageContainer>
  );
}
