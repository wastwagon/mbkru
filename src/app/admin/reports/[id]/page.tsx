import Link from "next/link";
import { notFound } from "next/navigation";

import {
  hidePublicCauseCommentAction,
  updatePublicCauseThreadAction,
} from "@/app/admin/reports/public-cause-actions";
import {
  addCitizenReportAdminReplyAction,
  setCitizenReportAdminReplyVisibilityAction,
  updateCitizenReportAdminReplyAction,
  updateCitizenReportOperationsAction,
  updateCitizenReportStatusAction,
} from "@/app/admin/reports/actions";
import {
  formatUtcForDatetimeLocalInput,
  isCitizenReportSlaOverdue,
} from "@/lib/admin/report-operations-datetime";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { roundApproximateCoord } from "@/lib/geo/round-approximate-coord";
import { destructiveTextControlClass, primaryLinkClass } from "@/lib/primary-link-styles";

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
      publicCauseComments: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { member: { select: { email: true, displayName: true } } },
      },
      adminReplies: {
        orderBy: { createdAt: "asc" },
        include: {
          admin: { select: { email: true } },
          editedBy: { select: { email: true } },
        },
      },
    },
  });

  if (!report) notFound();

  const replyAuditLogs = await prisma.citizenReportAdminReplyAuditLog.findMany({
    where: { reportId: report.id },
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { admin: { select: { email: true } } },
  });

  const slaOverdue = isCitizenReportSlaOverdue(report.slaDueAt, report.status);
  const smsEligible = Boolean(
    report.submitterPhone?.trim().startsWith("+") || report.member?.phone?.trim().startsWith("+"),
  );

  return (
    <AdminPageContainer width="form">
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
      {sp.saved === "cause" ? (
        <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Public cause settings saved.
        </p>
      ) : null}
      {sp.saved === "comment" ? (
        <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Comment updated.
        </p>
      ) : null}
      {sp.saved === "reply" ? (
        <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Submitter-visible note posted.
        </p>
      ) : null}
      {sp.saved === "reply_edit" ? (
        <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Note updated.
        </p>
      ) : null}
      {sp.saved === "reply_visibility" ? (
        <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Note visibility saved.
        </p>
      ) : null}
      {sp.error === "reply_invalid" ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          Enter a non-empty message for the team note (max 12,000 characters).
        </p>
      ) : null}
      {sp.error === "cause_invalid" ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          Check slug (lowercase, hyphens), title, and summary length for the public cause.
        </p>
      ) : null}
      {sp.error === "cause_slug_clash" ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          That public URL slug is already used on another report.
        </p>
      ) : null}

      <AdminPageHeader
        showDashboardBack={false}
        title={report.title}
        titleClassName="line-clamp-2"
        backSlot={
          <>
            <Link href="/admin/reports" className={primaryLinkClass}>
              ← All reports
            </Link>
            {report.publicCauseOpenedAt != null || (report.publicCauseSlug?.trim() ?? "").length > 0 ? (
              <>
                {" · "}
                <Link href="/admin/public-causes" className={primaryLinkClass}>
                  Public causes queue
                </Link>
                {report.publicCauseOpenedAt != null && report.publicCauseSlug?.trim() ? (
                  <>
                    {" · "}
                    <Link
                      href={`/citizens-voice/causes/${encodeURIComponent(report.publicCauseSlug.trim())}`}
                      className={primaryLinkClass}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live page
                    </Link>
                  </>
                ) : null}
              </>
            ) : null}
          </>
        }
      />

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
        {report.localArea ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Local area (submitter): </dt>
            <dd className="inline">{report.localArea}</dd>
          </div>
        ) : null}
        {report.latitude != null && report.longitude != null ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Approximate coordinates (~1 km): </dt>
            <dd className="inline font-mono text-xs">
              {roundApproximateCoord(report.latitude).toFixed(2)}, {roundApproximateCoord(report.longitude).toFixed(2)}
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

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Submitter-visible notes</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Shown to the reporter on <strong className="text-[var(--foreground)]">My reports</strong> (signed-in) and on{" "}
          <strong className="text-[var(--foreground)]">Track a report</strong> when they enter this tracking code. You
          can edit wording, or hide a note from the submitter without deleting it. This is not the same as internal
          staff notes below — do not paste the private narrative here.
        </p>
        {report.adminReplies.length > 0 ? (
          <ul className="mt-4 space-y-6 border-t border-[var(--border)] pt-4">
            {report.adminReplies.map((r) => {
              const edited = r.updatedAt.getTime() !== r.createdAt.getTime();
              return (
                <li
                  key={r.id}
                  className={`rounded-xl border p-4 text-sm ${
                    r.visibleToSubmitter ? "border-[var(--border)]" : "border-amber-300 bg-amber-50/40"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <span>{r.createdAt.toISOString().slice(0, 16)} UTC</span>
                    {edited ? (
                      <span className="rounded bg-[var(--muted)]/30 px-1.5 py-0.5">edited</span>
                    ) : null}
                    {!r.visibleToSubmitter ? (
                      <span className="rounded bg-amber-200/80 px-1.5 py-0.5 font-medium text-amber-950">
                        Hidden from submitter
                      </span>
                    ) : null}
                    {r.admin?.email ? (
                      <span className="font-mono text-[var(--foreground)]">{r.admin.email}</span>
                    ) : (
                      <span>(admin record removed)</span>
                    )}
                  </div>
                  {r.editedBy?.email ? (
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Last edited by <span className="font-mono text-[var(--foreground)]">{r.editedBy.email}</span>
                    </p>
                  ) : null}
                  <form action={updateCitizenReportAdminReplyAction} className="mt-3 space-y-2">
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="replyId" value={r.id} />
                    <textarea
                      name="body"
                      rows={4}
                      maxLength={12000}
                      required
                      defaultValue={r.body}
                      className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
                    />
                    <label className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                      <input type="checkbox" name="notifyEmail" className="mt-0.5 h-4 w-4 rounded border-[var(--border)]" />
                      <span>
                        Email the submitter this updated text (<code className="text-[10px]">RESEND_API_KEY</code>)
                      </span>
                    </label>
                    {smsEligible ? (
                      <label className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                        <input type="checkbox" name="notifySms" className="mt-0.5 h-4 w-4 rounded border-[var(--border)]" />
                        <span>
                          SMS a short “updated note” alert (<code className="text-[10px]">SMS_PROVIDER</code>)
                        </span>
                      </label>
                    ) : null}
                    <button
                      type="submit"
                      className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]/15"
                    >
                      Save changes
                    </button>
                  </form>
                  <form action={setCitizenReportAdminReplyVisibilityAction} className="mt-3 space-y-2">
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="replyId" value={r.id} />
                    <input type="hidden" name="visible" value={r.visibleToSubmitter ? "0" : "1"} />
                    {!r.visibleToSubmitter ? (
                      <>
                        <label className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                          <input
                            type="checkbox"
                            name="notifyUnhideEmail"
                            className="mt-0.5 h-4 w-4 rounded border-[var(--border)]"
                          />
                          <span>
                            Email the submitter that a note is visible again (
                            <code className="text-[10px]">RESEND_API_KEY</code>)
                          </span>
                        </label>
                        {smsEligible ? (
                          <label className="flex items-start gap-2 text-xs text-[var(--foreground)]">
                            <input
                              type="checkbox"
                              name="notifyUnhideSms"
                              className="mt-0.5 h-4 w-4 rounded border-[var(--border)]"
                            />
                            <span>
                              SMS a short alert (<code className="text-[10px]">SMS_PROVIDER</code>)
                            </span>
                          </label>
                        ) : null}
                        {report.memberId ? (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Signed-in members also get an in-app notification when you show the note again.
                          </p>
                        ) : null}
                      </>
                    ) : null}
                    <button
                      type="submit"
                      className={`${primaryLinkClass} block text-xs`}
                    >
                      {r.visibleToSubmitter ? "Hide from submitter (track + account)" : "Show to submitter again"}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">No notes yet.</p>
        )}
        <form action={addCitizenReportAdminReplyAction} className="mt-6 border-t border-[var(--border)] pt-5">
          <input type="hidden" name="reportId" value={report.id} />
          <label htmlFor="adminReplyBody" className="block text-sm font-medium text-[var(--foreground)]">
            Add note
          </label>
          <textarea
            id="adminReplyBody"
            name="body"
            rows={5}
            maxLength={12000}
            required
            placeholder="Short update the submitter can safely read…"
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
          />
          <label className="mt-3 flex items-start gap-2 text-sm text-[var(--foreground)]">
            <input type="checkbox" name="notifyEmail" className="mt-1 h-4 w-4 rounded border-[var(--border)]" />
            <span>
              Also email this note to the submitter address on file (needs{" "}
              <code className="text-xs">RESEND_API_KEY</code>).
            </span>
          </label>
          {smsEligible ? (
            <label className="mt-2 flex items-start gap-2 text-sm text-[var(--foreground)]">
              <input type="checkbox" name="notifySms" className="mt-1 h-4 w-4 rounded border-[var(--border)]" />
              <span>
                Also SMS a short alert (E.164 number on file; needs{" "}
                <code className="text-xs">SMS_PROVIDER</code>).
              </span>
            </label>
          ) : (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              SMS alert requires a valid E.164 number on the member profile or submitter phone field.
            </p>
          )}
          {report.memberId ? (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Signed-in members also receive an in-app notification automatically.
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Post note
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Team note audit trail</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Append-only log of posts, edits, and visibility changes (no full message bodies stored here).
        </p>
        {replyAuditLogs.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">No audit entries yet.</p>
        ) : (
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-xs">
            {replyAuditLogs.map((log) => {
              const label =
                log.action === "REPLY_POSTED"
                  ? "Posted"
                  : log.action === "REPLY_EDITED"
                    ? "Edited"
                    : log.action === "REPLY_VISIBILITY"
                      ? "Visibility"
                      : log.action;
              return (
                <li
                  key={log.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--section-light)]/30 px-3 py-2 font-mono text-[11px] text-[var(--muted-foreground)]"
                >
                  <span className="text-[var(--foreground)]">{label}</span>
                  {" · "}
                  {log.createdAt.toISOString().slice(0, 19)}Z · reply{" "}
                  <span className="text-[var(--foreground)]">{log.replyId.slice(0, 8)}…</span>
                  {log.admin?.email ? (
                    <>
                      {" · "}
                      <span className="text-[var(--foreground)]">{log.admin.email}</span>
                    </>
                  ) : null}
                  {log.details != null ? (
                    <span className="mt-1 block whitespace-pre-wrap break-all text-[10px] opacity-90">
                      {JSON.stringify(log.details)}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {report.attachments.length > 0 ? (
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Attachments</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {report.attachments.map((a) => {
              const isImage = a.mimeType.startsWith("image/");
              const attachmentUrl = `/api/reports/${encodeURIComponent(report.id)}/attachments/${encodeURIComponent(a.id)}`;
              return (
                <li key={a.id} className="rounded-lg border border-[var(--border)] p-3">
                  {isImage ? (
                    <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-only local uploads */}
                      <img
                        src={attachmentUrl}
                        alt=""
                        className="max-h-40 w-full rounded-md object-contain bg-[var(--muted)]/10"
                      />
                    </a>
                  ) : null}
                  <a
                    href={attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${primaryLinkClass} mt-2 block text-sm break-all`}
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
        action={updatePublicCauseThreadAction}
        className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5"
      >
        <input type="hidden" name="id" value={report.id} />
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Public cause thread</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Publishes a <strong className="text-[var(--foreground)]">sanitized summary only</strong> at{" "}
          <code className="text-xs">/citizens-voice/causes/[slug]</code>. Never copy-paste the full private narrative
          here. Use a short headline and a vetted public summary. Members can support and comment on the public page.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="publicCauseSlug" className="block text-sm font-medium text-[var(--foreground)]">
              URL slug
            </label>
            <input
              id="publicCauseSlug"
              name="publicCauseSlug"
              type="text"
              defaultValue={report.publicCauseSlug ?? ""}
              placeholder="e.g. market-access-road"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 font-mono text-sm"
            />
          </div>
          <div>
            <label htmlFor="publicCauseTitle" className="block text-sm font-medium text-[var(--foreground)]">
              Public headline
            </label>
            <input
              id="publicCauseTitle"
              name="publicCauseTitle"
              type="text"
              maxLength={240}
              defaultValue={report.publicCauseTitle ?? ""}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="publicCauseSummary" className="block text-sm font-medium text-[var(--foreground)]">
              Public summary (shown on site)
            </label>
            <textarea
              id="publicCauseSummary"
              name="publicCauseSummary"
              rows={8}
              maxLength={12000}
              defaultValue={report.publicCauseSummary ?? ""}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              name="publish"
              defaultChecked={Boolean(report.publicCauseOpenedAt)}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            Publish (sets open timestamp the first time)
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              name="close"
              defaultChecked={report.publicCauseClosed}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            Close thread (read-only on public page)
          </label>
          <label className="flex items-center gap-2 text-sm text-amber-900">
            <input type="checkbox" name="unpublish" className="h-4 w-4 rounded border-[var(--border)]" />
            Remove public cause entirely (clears slug, summary, and comments remain in DB but hidden from public)
          </label>
        </div>
        <button
          type="submit"
          className="mt-5 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
        >
          Save public cause
        </button>
      </form>

      {report.publicCauseComments.length > 0 ? (
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Public cause comments</h2>
          <ul className="mt-4 space-y-4">
            {report.publicCauseComments.map((c) => (
              <li key={c.id} className="border-b border-[var(--border)] pb-4 text-sm last:border-0">
                <p className="text-xs text-[var(--muted-foreground)]">
                  {c.member.displayName ?? c.member.email} · {c.status} · {c.createdAt.toISOString().slice(0, 16)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[var(--foreground)]">{c.body}</p>
                {c.status === "VISIBLE" ? (
                  <form action={hidePublicCauseCommentAction} className="mt-2">
                    <input type="hidden" name="commentId" value={c.id} />
                    <input type="hidden" name="reportId" value={report.id} />
                    <button
                      type="submit"
                      className={`text-xs font-medium text-red-700 ${destructiveTextControlClass}`}
                    >
                      Hide comment
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
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
    </AdminPageContainer>
  );
}
