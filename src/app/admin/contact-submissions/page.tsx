import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTablePanel } from "@/components/admin/AdminTablePanel";
import { AdminTd } from "@/components/admin/AdminTd";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export default async function AdminContactSubmissionsPage() {
  await requireAdminSession();

  const rows = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Contact form"
        description={
          <>
            <p>
              Messages from{" "}
              <code className="rounded bg-[var(--section-light)] px-1 text-xs">POST /api/contact</code>. Rows are
              stored when <code className="rounded bg-[var(--section-light)] px-1 text-xs">DATABASE_URL</code> is set
              (even before email delivery runs).
            </p>
            <p className="mt-3 flex flex-wrap gap-4 text-sm">
              <Link href="/admin/leads" className={primaryLinkClass}>
                Lead capture (newsletter / waitlists)
              </Link>
              <Link href="/admin/diaspora-feedback" className={primaryLinkClass}>
                Diaspora experience &amp; feedback
              </Link>
            </p>
          </>
        }
      />

      <AdminTablePanel className="mt-2">
        <table className="admin-table-stack min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--section-light)]/80 text-[var(--foreground-secondary)]">
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
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--foreground-secondary)]">
                  <AdminEmptyState message="No submissions yet." className="text-center" />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-[var(--section-light)]/40">
                  <AdminTd label="Received" className="whitespace-nowrap px-4 py-3 text-[var(--foreground-secondary)] sm:px-4 sm:py-3">
                    {row.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </AdminTd>
                  <AdminTd label="From" className="px-4 py-3 sm:px-4 sm:py-3">
                    <p className="font-medium text-[var(--foreground)]">{row.name}</p>
                    <p className="font-mono text-xs text-[var(--foreground-secondary)]">{row.email}</p>
                  </AdminTd>
                  <AdminTd label="Subject" className="max-w-[200px] px-4 py-3 text-[var(--foreground)] sm:px-4 sm:py-3">
                    {row.subject}
                  </AdminTd>
                  <AdminTd label="Type" className="px-4 py-3 text-[var(--foreground-secondary)] sm:px-4 sm:py-3">
                    {row.enquiryType ?? "—"}
                  </AdminTd>
                  <AdminTd label="Message" className="max-w-md px-4 py-3 text-[var(--foreground-secondary)] sm:px-4 sm:py-3">
                    <details className="cursor-pointer">
                      <summary className={`${primaryLinkClass} cursor-pointer text-xs`}>View full message</summary>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">{row.message}</p>
                    </details>
                  </AdminTd>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTablePanel>
    </AdminPageContainer>
  );
}
