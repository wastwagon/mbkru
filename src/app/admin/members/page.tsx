import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminListPanel } from "@/components/admin/AdminListPanel";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";

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
    <AdminPageContainer width="narrow">
      <AdminPageHeader
        title="Members"
        description={
          <>
            <p>Public accounts that use Voice and related tools.</p>
            <p className="mt-2">
              Identity status is staff-controlled in this console (not Ghana Card upload in this MVP). Showing the latest
              200 signups.
            </p>
          </>
        }
      />

      <AdminListPanel>
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
      </AdminListPanel>
    </AdminPageContainer>
  );
}
