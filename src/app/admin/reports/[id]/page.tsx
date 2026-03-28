import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCitizenReportStatusAction } from "@/app/admin/reports/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

import type { CitizenReportStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: CitizenReportStatus; label: string }[] = [
  { value: "RECEIVED", label: "Received" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "ESCALATED", label: "Escalated" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" },
];

type Props = { params: Promise<{ id: string }> };

export default async function AdminReportDetailPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const report = await prisma.citizenReport.findUnique({
    where: { id },
    include: {
      region: true,
      constituency: true,
      member: { select: { id: true, email: true, displayName: true } },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!report) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin/reports" className="text-[var(--primary)] hover:underline">
          ← All reports
        </Link>
      </p>

      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)] line-clamp-2">
        {report.title}
      </h1>

      {report.kind === "SITUATIONAL_ALERT" ? (
        <div
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="note"
        >
          <p className="font-semibold">Moderation — situational alert</p>
          <p className="mt-1 text-amber-900/90">
            Verify time, place, and observable facts before escalation or external sharing. Do not treat this
            submission as confirmed news.
          </p>
        </div>
      ) : null}
      {report.kind === "ELECTION_OBSERVATION" ? (
        <div
          className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950"
          role="note"
        >
          <p className="font-semibold">Moderation — election observation</p>
          <p className="mt-1 text-blue-900/90">
            Apply election-period policies and legal review before publication or third-party relay.
          </p>
        </div>
      ) : null}

      <dl className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)]">
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Tracking code: </dt>
          <dd className="inline font-mono">{report.trackingCode}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Kind: </dt>
          <dd className="inline">{report.kind.replace(/_/g, " ")}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Status: </dt>
          <dd className="inline">{report.status.replace(/_/g, " ")}</dd>
        </div>
        {report.region ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Region: </dt>
            <dd className="inline">{report.region.name}</dd>
          </div>
        ) : null}
        {report.constituency ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Constituency: </dt>
            <dd className="inline">{report.constituency.name}</dd>
          </div>
        ) : null}
        {(report.latitude != null && report.longitude != null) ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Coordinates: </dt>
            <dd className="inline">
              {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Submitter email: </dt>
          <dd className="inline">{report.submitterEmail ?? "—"}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Member: </dt>
          <dd className="inline">
            {report.member
              ? `${report.member.email}${report.member.displayName ? ` (${report.member.displayName})` : ""}`
              : "—"}
          </dd>
        </div>
        {report.category ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Category: </dt>
            <dd className="inline">{report.category}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Narrative</h2>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-[var(--muted-foreground)]">
          {report.body}
        </pre>
      </div>

      {report.attachments.length > 0 ? (
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Attachments</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {report.attachments.map((a) => {
              const isImage = a.mimeType.startsWith("image/");
              return (
                <li key={a.id} className="rounded-lg border border-[var(--border)] p-3">
                  {isImage ? (
                    <a href={a.path} target="_blank" rel="noopener noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-only local uploads */}
                      <img
                        src={a.path}
                        alt=""
                        className="max-h-40 w-full rounded-md object-contain bg-[var(--muted)]/10"
                      />
                    </a>
                  ) : null}
                  <a
                    href={a.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-sm text-[var(--primary)] underline break-all"
                  >
                    {a.mimeType === "application/pdf"
                      ? "Open PDF"
                      : isImage
                        ? "View full size"
                        : "Open file"}
                  </a>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{a.mimeType}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <form action={updateCitizenReportStatusAction} className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5">
        <input type="hidden" name="id" value={report.id} />
        <label htmlFor="status" className="block text-sm font-medium text-[var(--foreground)]">
          Update status
        </label>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          If Resend is configured, the submitter receives an email when the status changes.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <select
            id="status"
            name="status"
            defaultValue={report.status}
            className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm sm:max-w-xs"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Save status
          </button>
        </div>
      </form>
    </div>
  );
}
