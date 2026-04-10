import Link from "next/link";
import { notFound } from "next/navigation";

import { getMemberSession } from "@/lib/member/session";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { prisma } from "@/lib/db/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AccountReportDetailPage({ params }: Props) {
  if (!isCitizensVoiceEnabled()) notFound();

  const session = await getMemberSession();
  if (!session) return null;

  const { id } = await params;
  const report = await prisma.citizenReport.findFirst({
    where: { id, memberId: session.memberId },
    select: {
      id: true,
      trackingCode: true,
      title: true,
      kind: true,
      status: true,
      body: true,
      category: true,
      createdAt: true,
      updatedAt: true,
      region: { select: { name: true } },
      adminReplies: {
        where: { visibleToSubmitter: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, body: true, createdAt: true },
      },
    },
  });

  if (!report) notFound();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/account/reports" className="text-[var(--primary)] hover:underline">
          ← My reports
        </Link>
        {" · "}
        <Link href={`/track-report?code=${encodeURIComponent(report.trackingCode)}`} className="text-[var(--primary)] hover:underline">
          Track by code
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">{report.title}</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        <span className="font-mono text-[var(--foreground)]">{report.trackingCode}</span> ·{" "}
        {report.kind.replace(/_/g, " ")} · {report.status.replace(/_/g, " ")}
        {report.region ? ` · ${report.region.name}` : null}
      </p>
      {report.category ? (
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Category: {report.category}</p>
      ) : null}

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--section-light)]/40 p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Your submission</h2>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-[var(--muted-foreground)]">{report.body}</pre>
      </div>

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Notes from MBKRU</h2>
        {report.adminReplies.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            No team notes yet. You will see updates here when staff post a message on your report.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {report.adminReplies.map((r) => (
              <li key={r.id} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                <p className="text-xs text-[var(--muted-foreground)]">
                  {r.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">{r.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-8 text-xs text-[var(--muted-foreground)]">
        Last updated {report.updatedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
      </p>
    </div>
  );
}
