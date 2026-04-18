import Link from "next/link";

import { accountabilityProse } from "@/config/accountability-catalogue-destinations";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">
        {accountabilityProse.adminParliamentSectionTitle}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        {accountabilityProse.adminParliamentIntro}{" "}
        <code className="rounded bg-[var(--section-light)] px-1 text-xs">GET /api/mps</code>
        {" · "}
        <code className="rounded bg-[var(--section-light)] px-1 text-xs">GET /api/promises</code>.
      </p>

      <div className="mt-8 space-y-6">
        <ConstituencyCsvImport />
        <ParliamentCsvReconcile />
        <ParliamentCsvImport />
      </div>

      <ul className="mt-8 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {members.length === 0 ? (
          <li className="p-6 text-sm text-[var(--muted-foreground)]">
            No parliament members yet — upload a CSV above.
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
              <Link
                href={`/admin/parliament/${m.id}`}
                className="shrink-0 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Edit / catalogue
              </Link>
            </li>
          ))
        )}
      </ul>

      <p className="mt-8">
        <Link href="/admin" className="text-sm text-[var(--primary)] hover:underline">
          ← Dashboard
        </Link>
      </p>
    </div>
  );
}
