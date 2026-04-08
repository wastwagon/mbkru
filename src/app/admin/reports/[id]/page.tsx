import Link from "next/link";
import { notFound } from "next/navigation";

import {
  updateCitizenReportOperationsAction,
  updateCitizenReportStatusAction,
} from "@/app/admin/reports/actions";
import {
  formatUtcForDatetimeLocalInput,
  isCitizenReportSlaOverdue,
} from "@/lib/admin/report-operations-datetime";
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

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; saved?: string }>;
};

export default async function AdminReportDetailPage({ params, searchParams }: Props) {
  await requireAdminSession();
  const { id } = await params;
  const sp = (await searchParams) ?? {};

  const report = await prisma.citizenReport.findUnique({
    where: { id },
    include: {
      region: true,
      constituency: true,
      member: { select: { id: true, email: true, displayName: true, phone: true } },
      attachments: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!report) notFound();

  const slaOverdue = isCitizenReportSlaOverdue(report.slaDueAt, report.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {sp.error === "sla_invalid" ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          SLA date could not be read. Use the datetime picker or clear the field.
        </p>
      ) : null}
      {sp.saved === "ops" ? (
        <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Operations fields saved.
        </p>
      ) : null}

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
        {report.slaDueAt ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">SLA target (UTC): </dt>
            <dd className="inline">
              {report.slaDueAt.toISOString().replace("T", " ").slice(0, 16)}
              {slaOverdue ? (
                <span className="ml-2 font-semibold text-amber-800">· Overdue</span>
              ) : null}
            </dd>
          </div>
        ) : null}
        {report.operationsPlaybookKey ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Playbook: </dt>
            <dd className="inline font-mono text-xs">{report.operationsPlaybookKey}</dd>
          </div>
        ) : null}
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
          <dt className="inline font-medium text-[var(--foreground)]">Submitter phone (SMS): </dt>
          <dd className="inline font-mono text-sm">{report.submitterPhone ?? "—"}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Member: </dt>
          <dd className="inline">
            {report.member
              ? `${report.member.email}${report.member.displayName ? ` (${report.member.displayName})` : ""}`
              : "—"}
          </dd>
        </div>
        {report.member?.phone ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Member phone: </dt>
            <dd className="inline font-mono text-sm">{report.member.phone}</dd>
          </div>
        ) : null}
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

      <form
        action={updateCitizenReportOperationsAction}
        className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5"
      >
        <input type="hidden" name="id" value={report.id} />
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Operations &amp; SLA</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Internal use only — not emailed to submitters. For situational and election reports, record playbook
          references and response targets. SLA time uses{" "}
          <strong className="text-[var(--foreground)]">UTC</strong> (matches the picker below).
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="slaDueAt" className="block text-sm font-medium text-[var(--foreground)]">
              SLA target (UTC)
            </label>
            <input
              id="slaDueAt"
              name="slaDueAt"
              type="datetime-local"
              defaultValue={report.slaDueAt ? formatUtcForDatetimeLocalInput(report.slaDueAt) : ""}
              className="mt-1 w-full max-w-md rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Leave blank to clear.</p>
          </div>
          <div>
            <label htmlFor="operationsPlaybookKey" className="block text-sm font-medium text-[var(--foreground)]">
              Playbook / runbook key
            </label>
            <input
              id="operationsPlaybookKey"
              name="operationsPlaybookKey"
              type="text"
              maxLength={160}
              defaultValue={report.operationsPlaybookKey ?? ""}
              placeholder="e.g. situational-v1, election-day-2028"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-mono"
            />
          </div>
          <div>
            <label htmlFor="staffNotes" className="block text-sm font-medium text-[var(--foreground)]">
              Staff notes
            </label>
            <textarea
              id="staffNotes"
              name="staffNotes"
              rows={5}
              maxLength={20_000}
              defaultValue={report.staffNotes ?? ""}
              placeholder="Triage context, escalation contacts, verification steps…"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]/20"
        >
          Save operations
        </button>
      </form>

      <form action={updateCitizenReportStatusAction} className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5">
        <input type="hidden" name="id" value={report.id} />
        <label htmlFor="status" className="block text-sm font-medium text-[var(--foreground)]">
          Update status
        </label>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          If Resend is configured, the submitter receives an email when the status changes. If{" "}
          <code className="text-xs">SMS_PROVIDER</code> is set and a valid E.164 number is on file (submitter or
          member profile), an SMS is sent in parallel (Twilio when configured).
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
