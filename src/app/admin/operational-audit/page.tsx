import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";

type Props = {
  searchParams?: Promise<{
    action?: string;
    adminId?: string;
    hours?: string;
  }>;
};

const DEFAULT_HOURS = 72;
const MAX_ROWS = 200;

export default async function AdminOperationalAuditPage({ searchParams }: Props) {
  await requireAdminSession();
  const sp = (await searchParams) ?? {};

  const selectedAction = (sp.action ?? "").trim();
  const selectedAdminId = (sp.adminId ?? "").trim();
  const parsedHours = Number.parseInt((sp.hours ?? String(DEFAULT_HOURS)).trim(), 10);
  const hours = Number.isFinite(parsedHours) && parsedHours > 0 ? Math.min(parsedHours, 24 * 30) : DEFAULT_HOURS;

  // eslint-disable-next-line react-hooks/purity -- server component; request-scoped audit window
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const where = {
    createdAt: { gte: since },
    ...(selectedAction ? { action: selectedAction } : {}),
    ...(selectedAdminId ? { adminId: selectedAdminId } : {}),
  };

  const [logs, actions, admins] = await Promise.all([
    prisma.adminOperationalAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
      include: { admin: { select: { id: true, email: true } } },
    }),
    prisma.adminOperationalAuditLog.findMany({
      distinct: ["action"],
      orderBy: { action: "asc" },
      select: { action: true },
      take: 100,
    }),
    prisma.admin.findMany({
      orderBy: { email: "asc" },
      select: { id: true, email: true },
      take: 200,
    }),
  ]);

  return (
    <AdminPageContainer width="wide">
      <AdminPageHeader
        title="Operational audit log"
        description="Review sensitive admin actions, including notification retries, queue resets, and related controls."
      />

      <form className="mt-2 grid gap-3 rounded-xl border border-[var(--border)] bg-white p-4 md:grid-cols-4">
        <div>
          <label htmlFor="hours" className="block text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Window (hours)
          </label>
          <input
            id="hours"
            name="hours"
            type="number"
            min={1}
            max={24 * 30}
            defaultValue={hours}
            className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="action" className="block text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Action
          </label>
          <select
            id="action"
            name="action"
            defaultValue={selectedAction}
            className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            {actions.map((a) => (
              <option key={a.action} value={a.action}>
                {a.action}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="adminId" className="block text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Admin
          </label>
          <select
            id="adminId"
            name="adminId"
            defaultValue={selectedAdminId}
            className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.email}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-lg bg-[var(--primary)] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Apply
          </button>
          <Link href="/admin/operational-audit" className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm">
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-white p-4">
        <p className="text-xs text-[var(--muted-foreground)]">
          Showing {logs.length} row(s), newest first. Time window starts at {since.toISOString()}.
        </p>
        <ul className="mt-3 space-y-2">
          {logs.length === 0 ? (
            <li className="rounded-lg border border-[var(--border)] bg-[var(--section-light)]/30 px-3 py-2 text-sm text-[var(--muted-foreground)]">
              No audit rows for current filters.
            </li>
          ) : (
            logs.map((row) => (
              <li key={row.id} className="rounded-lg border border-[var(--border)] bg-[var(--section-light)]/20 px-3 py-2 text-sm">
                <p className="font-mono text-[11px] text-[var(--muted-foreground)]">{row.id}</p>
                <p className="text-[var(--foreground)]">
                  <span className="font-semibold">{row.action}</span> · {row.admin.email}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">{row.createdAt.toISOString()}</p>
                {row.details ? (
                  <pre className="mt-1 overflow-x-auto rounded bg-black/5 px-2 py-1 text-[11px] text-[var(--foreground)]">
                    {JSON.stringify(row.details, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </AdminPageContainer>
  );
}
