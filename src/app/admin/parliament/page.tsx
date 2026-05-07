import Link from "next/link";

import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminListPanel } from "@/components/admin/AdminListPanel";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";

import { ConstituencyCsvImport } from "./ConstituencyCsvImport";
import { ParliamentCsvImport } from "./ParliamentCsvImport";
import { ParliamentCsvReconcile } from "./ParliamentCsvReconcile";

export default async function AdminParliamentPage() {
  await requireAdminSession();

  const members = await prisma.parliamentMember.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      constituency: { select: { name: true, slug: true } },
      _count: { select: { promises: true } },
    },
  });

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title={accountabilityProse.adminParliamentSectionTitle}
        description={
          <>
            {accountabilityProse.adminParliamentIntro}{" "}
            <code className="rounded bg-[var(--section-light)] px-1 text-xs">GET /api/mps</code>
            {" · "}
            <code className="rounded bg-[var(--section-light)] px-1 text-xs">GET /api/promises</code>.
          </>
        }
      />

      <div className="space-y-6">
        <ConstituencyCsvImport />
        <ParliamentCsvReconcile />
        <ParliamentCsvImport />
      </div>

      <AdminListPanel className="mt-8">
        {members.length === 0 ? (
          <li className="p-6">
            <AdminEmptyState message="No parliament members yet — upload a CSV above." />
          </li>
        ) : (
          members.map((m) => (
            <li key={m.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--foreground)]">
                  {m.name}
                  {!m.active ? (
                    <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">(inactive)</span>
                  ) : null}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  <span className="font-mono">{m.slug}</span> · {m.role}
                  {m.party ? ` · ${m.party}` : ""}
                  {m.constituency ? ` · ${m.constituency.name}` : ""}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {m._count.promises} catalogue row{m._count.promises === 1 ? "" : "s"}
                </p>
              </div>
              <Link href={`/admin/parliament/${m.id}`} className={`${primaryNavLinkClass} shrink-0 text-sm font-semibold`}>
                Edit / catalogue
              </Link>
            </li>
          ))
        )}
      </AdminListPanel>
    </AdminPageContainer>
  );
}
