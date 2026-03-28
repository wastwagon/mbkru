import { prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { SignOutButton } from "./SignOutButton";

export default async function AccountPage() {
  const session = await getMemberSession();
  if (!session) return null;

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
        MBKRU Voice reporting and your full dashboard will appear here as Phase 2 features ship.
      </p>
      <div className="mt-8">
        <SignOutButton />
      </div>
    </div>
  );
}
