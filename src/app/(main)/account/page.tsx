import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { SignOutButton } from "./SignOutButton";

export default async function AccountPage() {
  const session = await getMemberSession();
  if (!session) return null;

  const voiceOn = isCitizensVoiceEnabled();

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { email: true, displayName: true, createdAt: true },
  });

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
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
      <p className="mt-6 text-sm text-[var(--muted-foreground)]">
        {voiceOn
          ? "Use the links below for MBKRU Voice pilot reporting."
          : "MBKRU Voice reporting and your full dashboard will appear here when this environment runs Phase 2+."}
      </p>
      {voiceOn ? (
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <Link href="/citizens-voice/submit" className="font-semibold text-[var(--primary)] hover:underline">
              Submit a report
            </Link>
          </li>
          <li>
            <Link href="/account/reports" className="font-semibold text-[var(--primary)] hover:underline">
              My reports
            </Link>
          </li>
          <li>
            <Link href="/track-report" className="text-[var(--primary)] hover:underline">
              Track by code
            </Link>
          </li>
        </ul>
      ) : null}
      <div className="mt-8">
        <SignOutButton />
      </div>
    </div>
  );
}
