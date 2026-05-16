import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTablePanel } from "@/components/admin/AdminTablePanel";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

const ratingLabel: Record<string, string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

const returnLabel: Record<string, string> = {
  YES: "Yes",
  NO: "No",
  MAYBE: "Maybe",
};

const engagementLabel: Record<string, string> = {
  RECENT_VISIT: "Visit",
  ABROAD_SUPPORTER: "Abroad",
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminDiasporaFeedbackPage() {
  await requireAdminSession();

  const rows = await prisma.diasporaFeedbackSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 400,
  });

  return (
    <AdminPageContainer width="wide">
      <AdminPageHeader
        title="Diaspora experience & feedback"
        description={
          <>
            <p>
              Submissions from <code className="rounded bg-[var(--section-light)] px-1 text-xs">/diaspora/feedback</code>{" "}
              via <code className="rounded bg-[var(--section-light)] px-1 text-xs">POST /api/diaspora-feedback</code>.
            </p>
            <p className="mt-3 flex flex-wrap gap-4 text-sm">
              <Link href="/admin/contact-submissions" className={primaryLinkClass}>
                Contact form
              </Link>
              <Link href="/diaspora/feedback" className={primaryLinkClass}>
                Open public form
              </Link>
            </p>
          </>
        }
      />

      <AdminTablePanel className="mt-2">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--section-light)]/80 text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Path</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Visit</th>
              <th className="px-4 py-3 font-medium">Stay</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Return / invest</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                  <AdminEmptyState message="No submissions yet." className="text-center" />
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-[var(--section-light)]/40">
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--muted-foreground)]">
                    {row.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--foreground)]">
                    {engagementLabel[row.engagementKind] ?? row.engagementKind}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--foreground)]">{row.fullName}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                      Signed: {row.signature} · {formatDate(row.formSignedDate)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${row.email}`} className={`${primaryLinkClass} font-mono text-xs`}>
                      {row.email}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--foreground)]">
                    {row.dateOfVisit ? formatDate(row.dateOfVisit) : "—"}
                  </td>
                  <td className="max-w-[140px] px-4 py-3 text-[var(--muted-foreground)]">{row.durationOfStay ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{ratingLabel[row.overallRating] ?? row.overallRating}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{returnLabel[row.returnOrInvest] ?? row.returnOrInvest}</td>
                  <td className="max-w-md px-4 py-3 text-[var(--muted-foreground)]">
                    <details className="cursor-pointer">
                      <summary className={`${primaryLinkClass} cursor-pointer text-xs`}>View responses</summary>
                      <div className="mt-3 space-y-3 text-sm text-[var(--foreground)]">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                            Events / programmes
                          </p>
                          <p className="mt-1 whitespace-pre-wrap">{row.eventsAttended ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                            Most meaningful
                          </p>
                          <p className="mt-1 whitespace-pre-wrap">{row.meaningfulAspects}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                            Suggestions
                          </p>
                          <p className="mt-1 whitespace-pre-wrap">{row.suggestionsImprovement}</p>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTablePanel>
    </AdminPageContainer>
  );
}
