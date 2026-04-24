import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";

export default async function AdminMembersPage() {
  await requireAdminSession();

  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
      identityVerificationStatus: true,
      identityVerifiedAt: true,
      region: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Members</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Public accounts (MBKRU Voice). Identity status is staff-controlled — not Ghana Card upload in this MVP. Latest 200 by signup
        date.
      </p>

      <ul className="mt-8 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {members.length === 0 ? (
          <li className="p-6 text-sm text-[var(--muted-foreground)]">No members yet.</li>
        ) : (
          members.map((m) => (
            <li key={m.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-[var(--foreground)]">{m.email}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {m.displayName ? `${m.displayName} · ` : null}
                  {m.region?.name ? `${m.region.name} · ` : null}
                  Joined {m.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                </p>
                <p className="mt-1 text-xs">
                  <span className="rounded-full bg-[var(--section-light)] px-2 py-0.5 font-semibold text-[var(--foreground)]">
                    {m.identityVerificationStatus}
                  </span>
                  {m.identityVerifiedAt ? (
                    <span className="ml-2 text-[var(--muted-foreground)]">
                      Verified {m.identityVerifiedAt.toLocaleDateString("en-GB")}
                    </span>
                  ) : null}
                </p>
              </div>
              <Link href={`/admin/members/${m.id}`} className={`${primaryNavLinkClass} shrink-0 text-sm font-semibold`}>
                Edit identity
              </Link>
            </li>
          ))
        )}
      </ul>

      <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className={primaryLinkClass}>
          ← Admin home
        </Link>
      </p>
    </div>
  );
}
