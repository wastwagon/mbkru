import Link from "next/link";
import { notFound } from "next/navigation";

import { getMemberSession } from "@/lib/member/session";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { prisma } from "@/lib/db/prisma";
import { formatSubmissionDateTime } from "@/lib/format-submission-datetime";

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
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Reports filed while signed in.{" "}
        <Link href="/account" className="text-[var(--primary)] hover:underline">
          Back to account
        </Link>
      </p>
      <ul className="mt-6 divide-y divide-[var(--border)]">
        {reports.length === 0 ? (
          <li className="py-6 text-sm text-[var(--muted-foreground)]">
            No reports yet.{" "}
            <Link href="/citizens-voice/submit" className="text-[var(--primary)] hover:underline">
              Submit one
            </Link>
          </li>
        ) : (
          reports.map((r) => (
            <li key={r.id} className="py-4">
              <p className="font-medium text-[var(--foreground)]">{r.title}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                <span className="font-mono">{r.trackingCode}</span> · {r.kind.replace(/_/g, " ")} ·{" "}
                {r.status.replace(/_/g, " ")}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
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
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <Link href={`/account/reports/${r.id}`} className="text-[var(--primary)] hover:underline">
                  View report
                  {r._count.adminReplies > 0 ? (
                    <span className="ml-1 tabular-nums text-[var(--muted-foreground)]">
                      ({r._count.adminReplies} note{r._count.adminReplies === 1 ? "" : "s"})
                    </span>
                  ) : null}
                </Link>
                <Link
                  href={`/track-report?code=${encodeURIComponent(r.trackingCode)}`}
                  className="text-[var(--primary)] hover:underline"
                >
                  Track by code
                </Link>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
