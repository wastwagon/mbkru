import Link from "next/link";

import { AccountStatGrid } from "@/components/account/AccountStatGrid";
import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import {
  isLegalEmpowermentPageEnabled,
  isPromisesBrowseEnabled,
  isReportCardPublicEnabled,
  isTownHallDirectoryPageEnabled,
} from "@/lib/reports/accountability-pages";
import {
  memberIdentityStatusDescription,
  memberIdentityStatusLabel,
} from "@/lib/member-identity-labels";
import { requestIdentityReviewAction } from "./actions";
import { SignOutButton } from "./SignOutButton";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default async function AccountPage() {
  const session = await getMemberSession();
  if (!session) return null;

  const voiceOn = isCitizensVoiceEnabled();
  const showPromises = isPromisesBrowseEnabled();
  const showReportCard = isReportCardPublicEnabled();
  const showLegal = isLegalEmpowermentPageEnabled();
  const showTownHalls = isTownHallDirectoryPageEnabled();

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: {
      email: true,
      displayName: true,
      createdAt: true,
      identityVerificationStatus: true,
      identityVerifiedAt: true,
      identityReviewRequestedAt: true,
    },
  });

  const unreadNotifications = await prisma.memberNotification.count({
    where: { memberId: session.memberId, readAt: null },
  });

  let totalReports = 0;
  let activeReports = 0;
  let resolvedReports = 0;
  let attachmentCount = 0;
  let lastSubmittedAt: Date | null = null;

  if (voiceOn) {
    const [total, active, resolved, files, latest] = await prisma.$transaction([
      prisma.citizenReport.count({ where: { memberId: session.memberId } }),
      prisma.citizenReport.count({
        where: {
          memberId: session.memberId,
          status: { in: ["RECEIVED", "UNDER_REVIEW", "ESCALATED"] },
        },
      }),
      prisma.citizenReport.count({
        where: {
          memberId: session.memberId,
          status: { in: ["CLOSED", "ARCHIVED"] },
        },
      }),
      prisma.citizenReportAttachment.count({
        where: { report: { memberId: session.memberId } },
      }),
      prisma.citizenReport.findFirst({
        where: { memberId: session.memberId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);
    totalReports = total;
    activeReports = active;
    resolvedReports = resolved;
    attachmentCount = files;
    lastSubmittedAt = latest?.createdAt ?? null;
  }

  const tileClass =
    "group relative flex flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Your account</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Signed in as <strong className="text-[var(--foreground)]">{member?.email ?? session.email}</strong>
            {member?.displayName ? (
              <>
                {" "}
                ({member.displayName})
              </>
            ) : null}
          </p>
          {member?.createdAt ? (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Member since{" "}
              {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
                member.createdAt,
              )}
            </p>
          ) : null}
        </div>
        {voiceOn ? (
          <div
            className="rounded-full border border-[var(--accent-gold)]/40 bg-[var(--accent-gold-light)]/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground)]"
            title="MBKRU Voice pilot"
          >
            Pilot access
          </div>
        ) : null}
      </div>

      {member ? (
        <section
          className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--section-light)]/50 p-4 sm:p-5"
          aria-labelledby="identity-heading"
        >
          <h2 id="identity-heading" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Membership verification
          </h2>
          <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
            {memberIdentityStatusLabel(member.identityVerificationStatus)}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
            {memberIdentityStatusDescription(member.identityVerificationStatus)}
          </p>
          {member.identityVerificationStatus === "VERIFIED" && member.identityVerifiedAt ? (
            <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">
              Confirmed {member.identityVerifiedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
            </p>
          ) : null}
          {member.identityVerificationStatus === "PENDING_REVIEW" && member.identityReviewRequestedAt ? (
            <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">
              Review requested{" "}
              {member.identityReviewRequestedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          ) : null}
          {member.identityVerificationStatus === "UNVERIFIED" || member.identityVerificationStatus === "REJECTED" ? (
            <form action={requestIdentityReviewAction} className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
              <p className="text-xs text-[var(--muted-foreground)]">
                Ask our team to review your membership for programme eligibility (optional message).
              </p>
              <label htmlFor="identity-review-message" className="sr-only">
                Optional message for reviewers
              </label>
              <textarea
                id="identity-review-message"
                name="message"
                rows={3}
                maxLength={2000}
                placeholder="Optional context for staff (max 2000 characters)"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
              >
                Request verification review
              </button>
            </form>
          ) : null}
        </section>
      ) : null}

      {voiceOn ? (
        <AccountStatGrid
          totalReports={totalReports}
          activeReports={activeReports}
          resolvedReports={resolvedReports}
          attachmentCount={attachmentCount}
          lastSubmittedAt={lastSubmittedAt}
        />
      ) : null}

      <section className={voiceOn ? "mt-10" : "mt-8"} aria-labelledby="voice-actions-heading">
        <h2 id="voice-actions-heading" className="font-display text-lg font-semibold text-[var(--foreground)]">
          {voiceOn ? "Voice pilot" : "Coming soon"}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {voiceOn
            ? "Submit, review, and track reports tied to your account."
            : "MBKRU Voice reporting and your full dashboard will appear here when Voice is enabled for this site."}
        </p>
        {voiceOn ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Link href="/citizens-voice/submit" className={tileClass}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/15 to-[var(--accent)]/10 text-[var(--primary)]">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
              <span className="mt-4 font-display text-base font-semibold text-[var(--foreground)]">
                Submit a report
              </span>
              <span className="mt-1 flex-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
                File a new Voice report with location and attachments.
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                Start
                <ChevronIcon className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link href="/account/reports" className={tileClass}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/15 to-[var(--accent)]/10 text-[var(--primary)]">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 6h16M4 12h10M4 18h14" strokeLinecap="round" />
                </svg>
              </span>
              <span className="mt-4 font-display text-base font-semibold text-[var(--foreground)]">My reports</span>
              <span className="mt-1 flex-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
                See status, titles, and tracking codes in one list.
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                Open list
                <ChevronIcon className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link href="/track-report" className={tileClass}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/20 to-[var(--accent-gold-light)]/50 text-[var(--foreground)]">
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                </svg>
              </span>
              <span className="mt-4 font-display text-base font-semibold text-[var(--foreground)]">Track by code</span>
              <span className="mt-1 flex-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
                Look up any report if you have its tracking code.
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
                Track
                <ChevronIcon className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        ) : null}
      </section>

      <section className="mt-10" aria-labelledby="inbox-heading">
        <h2 id="inbox-heading" className="font-display text-lg font-semibold text-[var(--foreground)]">
          Inbox
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Verification changes, community approvals, post status, and moderator alerts.
        </p>
        <Link href="/account/notifications" className={`${tileClass} mt-5 max-w-md`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/15 to-[var(--accent)]/10 text-[var(--primary)]">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="mt-4 flex flex-wrap items-center gap-2 font-display text-base font-semibold text-[var(--foreground)]">
            Notifications
            {unreadNotifications > 0 ? (
              <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[11px] font-bold text-white">
                {unreadNotifications} new
              </span>
            ) : null}
          </span>
          <span className="mt-1 flex-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
            Mark items read when you&apos;ve seen them. Same list is available via the API for apps.
          </span>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)]">
            Open inbox
            <ChevronIcon className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      {showPromises || showReportCard || showLegal || showTownHalls ? (
        <section className="mt-10" aria-labelledby="accountability-heading">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/50 p-5 sm:p-6">
            <h2
              id="accountability-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
            >
              Public accountability
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
              Explore promises, scores, and resources published for transparency.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {showPromises ? (
                <Link
                  href="/promises"
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--primary)] shadow-sm transition hover:border-[var(--primary)]/25 hover:shadow-md"
                >
                  Promises
                  <ChevronIcon />
                </Link>
              ) : null}
              {showReportCard ? (
                <Link
                  href="/report-card"
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--primary)] shadow-sm transition hover:border-[var(--primary)]/25 hover:shadow-md"
                >
                  Report card
                  <ChevronIcon />
                </Link>
              ) : null}
              <Link
                href="/methodology"
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--primary)] shadow-sm transition hover:border-[var(--primary)]/25 hover:shadow-md"
              >
                Methodology
                <ChevronIcon />
              </Link>
              {showLegal ? (
                <Link
                  href="/legal-empowerment"
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--primary)] shadow-sm transition hover:border-[var(--primary)]/25 hover:shadow-md"
                >
                  Legal
                  <ChevronIcon />
                </Link>
              ) : null}
              {showTownHalls ? (
                <Link
                  href="/town-halls"
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--primary)] shadow-sm transition hover:border-[var(--primary)]/25 hover:shadow-md"
                >
                  Forums
                  <ChevronIcon />
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-10 border-t border-[var(--border)] pt-8">
        <SignOutButton />
      </div>
    </div>
  );
}
