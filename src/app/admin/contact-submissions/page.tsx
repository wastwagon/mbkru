import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

export default async function AdminContactSubmissionsPage() {
  await requireAdminSession();

  const rows = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Contact form</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Messages from <code className="rounded bg-[var(--section-light)] px-1 text-xs">POST /api/contact</code>, stored
        when <code className="rounded bg-[var(--section-light)] px-1 text-xs">DATABASE_URL</code> is set (before email
        delivery).
      </p>

      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        <Link href="/admin/leads" className="text-[var(--primary)] hover:underline">
          Lead capture (newsletter / waitlists)
        </Link>
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--section-light)]/80 text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                  No submissions yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-[var(--section-light)]/40">
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--muted-foreground)]">
                    {row.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--foreground)]">{row.name}</p>
                    <p className="font-mono text-xs text-[var(--muted-foreground)]">{row.email}</p>
                  </td>
                  <td className="max-w-[200px] px-4 py-3 text-[var(--foreground)]">{row.subject}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{row.enquiryType ?? "—"}</td>
                  <td className="max-w-md px-4 py-3 text-[var(--muted-foreground)]">
                    <details className="cursor-pointer">
                      <summary className="text-xs font-medium text-[var(--primary)]">View full message</summary>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">{row.message}</p>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className="text-[var(--primary)] hover:underline">
          ← Dashboard
        </Link>
      </p>
    </div>
  );
}
