import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

export default async function AdminReportsPage() {
  await requireAdminSession();

  const reports = await prisma.citizenReport.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      region: { select: { name: true } },
    },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Citizen reports</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        MBKRU Voice queue — newest first. Open a row to change status and notify the submitter by email when
        Resend is configured.
      </p>

      <ul className="mt-8 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {reports.length === 0 ? (
          <li className="p-6 text-sm text-[var(--muted-foreground)]">No reports yet.</li>
        ) : (
          reports.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--foreground)] line-clamp-1">{r.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  <span className="font-mono">{r.trackingCode}</span> · {r.kind.replace(/_/g, " ")} ·{" "}
                  <span className="text-[var(--primary)]">{r.status.replace(/_/g, " ")}</span>
                  {r.region ? ` · ${r.region.name}` : ""}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {r.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <Link
                href={`/admin/reports/${r.id}`}
                className="shrink-0 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Review
              </Link>
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
