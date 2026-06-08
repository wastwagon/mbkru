import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db/prisma";
import { formatSubmissionDateTime } from "@/lib/format-submission-datetime";
import { getMemberSession } from "@/lib/member/session";
import { focusRingSmClass, primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";

export default async function AccountReportsPage() {
  if (!isCitizensVoiceEnabled()) notFound();

  const session = await getMemberSession();
  if (!session) return null;

  const reports = await prisma.citizenReport.findMany({
    where: { memberId: session.memberId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      trackingCode: true,
      title: true,
      kind: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          adminReplies: {
            where: { visibleToSubmitter: true },
          },
        },
      },
      adminReplies: {
        where: { visibleToSubmitter: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">My reports</h1>
      <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
        Reports filed while signed in.{" "}
        <Link href="/account" className={primaryLinkClass}>
          Back to account
        </Link>
      </p>
      <ul className="mt-6 space-y-3">
        {reports.length === 0 ? (
          <li className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/50 px-4 py-6 text-sm text-[var(--foreground-secondary)]">
            No reports yet.{" "}
            <Link href="/citizens-voice/submit" className={primaryLinkClass}>
              Submit one
            </Link>
          </li>
        ) : (
          reports.map((r) => (
            <li key={r.id}>
              <article className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/35 sm:p-5">
                <h2 className="font-medium text-[var(--foreground)]">{r.title}</h2>
                <p className="mt-1 font-mono text-xs font-semibold tracking-wide text-[var(--accent-gold)]">
                  {r.trackingCode}
                </p>
                <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                  {r.kind.replace(/_/g, " ")} · {r.status.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                  Submitted{" "}
                  <time dateTime={r.createdAt.toISOString()}>{formatSubmissionDateTime(r.createdAt)}</time>
                  {r.adminReplies[0]?.createdAt ? (
                    <>
                      {" "}
                      · Latest team note{" "}
                      <time dateTime={r.adminReplies[0].createdAt.toISOString()}>
                        {formatSubmissionDateTime(r.adminReplies[0].createdAt)}
                      </time>
                    </>
                  ) : null}
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <Link
                    href={`/track-report?code=${encodeURIComponent(r.trackingCode)}`}
                    className={`text-sm font-medium ${primaryNavLinkClass}`}
                  >
                    Track by code
                  </Link>
                  <Link
                    href={`/account/reports/${r.id}`}
                    className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`}
                  >
                    View report
                    {r._count.adminReplies > 0 ? (
                      <span className="ml-1.5 tabular-nums opacity-90">
                        ({r._count.adminReplies})
                      </span>
                    ) : null}
                  </Link>
                </div>
              </article>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
