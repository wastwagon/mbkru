import Link from "next/link";

import { updatePetitionStatusAction } from "@/app/admin/petitions/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

import type { PetitionStatus } from "@prisma/client";

const STATUS_TABS: { param: string; label: string; status?: PetitionStatus }[] = [
  { param: "", label: "All" },
  { param: "OPEN", label: "Open", status: "OPEN" },
  { param: "CLOSED", label: "Closed", status: "CLOSED" },
  { param: "ARCHIVED", label: "Archived", status: "ARCHIVED" },
];

function parseStatusParam(raw: string | string[] | undefined): PetitionStatus | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return undefined;
  const allowed: PetitionStatus[] = ["OPEN", "CLOSED", "ARCHIVED"];
  return allowed.includes(v as PetitionStatus) ? (v as PetitionStatus) : undefined;
}

type Props = {
  searchParams?: Promise<{ status?: string | string[]; saved?: string; error?: string }>;
};

export default async function AdminPetitionsPage({ searchParams }: Props) {
  await requireAdminSession();

  const sp = (await searchParams) ?? {};
  const statusFilter = parseStatusParam(sp.status);

  const petitions = await prisma.petition.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      author: { select: { email: true, displayName: true } },
      region: { select: { name: true } },
      _count: { select: { signatures: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className="text-[var(--primary)] hover:underline">
          ← Admin home
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">Petitions</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Close to stop new signatures, or archive to hide from the public site. Reopen returns a petition to open
        signatures.
      </p>
      <p className="mt-2 text-sm">
        <Link
          href="/admin/analytics/petition-pending"
          className="font-medium text-[var(--primary)] hover:underline"
        >
          Guest email-verification queue (analytics)
        </Link>
      </p>

      {sp.saved === "1" ? (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status">
          Petition status updated.
        </p>
      ) : null}
      {sp.error === "invalid" ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          Invalid request.
        </p>
      ) : null}
      {sp.error === "notfound" ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          Petition not found.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by petition status">
        {STATUS_TABS.map((t) => {
          const active =
            (t.param === "" && !statusFilter) || (t.status != null && t.status === statusFilter);
          const href = t.param ? `/admin/petitions?status=${encodeURIComponent(t.param)}` : "/admin/petitions";
          return (
            <Link
              key={t.param || "all"}
              href={href}
              scroll={false}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/40"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <ul className="mt-6 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {petitions.length === 0 ? (
          <li className="p-6 text-sm text-[var(--muted-foreground)]">No petitions in this view.</li>
        ) : (
          petitions.map((p) => (
            <li key={p.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--foreground)]">{p.title}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  <span
                    className={
                      p.status === "OPEN"
                        ? "font-medium text-emerald-700"
                        : p.status === "CLOSED"
                          ? "font-medium text-amber-800"
                          : "font-medium text-[var(--muted-foreground)]"
                    }
                  >
                    {p.status.replace(/_/g, " ")}
                  </span>
                  {" · "}
                  {p._count.signatures} signature{p._count.signatures === 1 ? "" : "s"}
                  {p.region?.name ? ` · ${p.region.name}` : ""}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  By {p.author.displayName ?? p.author.email} ·{" "}
                  <Link
                    href={`/petitions/${encodeURIComponent(p.slug)}`}
                    className="text-[var(--primary)] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    /petitions/{p.slug}
                  </Link>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.status === "OPEN" ? (
                  <>
                    <form action={updatePetitionStatusAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="CLOSED" />
                      <button
                        type="submit"
                        className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100"
                      >
                        Close
                      </button>
                    </form>
                    <form action={updatePetitionStatusAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="ARCHIVED" />
                      <button
                        type="submit"
                        className="rounded-lg border border-[var(--border)] bg-[var(--section-light)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]/20"
                      >
                        Archive
                      </button>
                    </form>
                  </>
                ) : null}
                {p.status === "CLOSED" ? (
                  <>
                    <form action={updatePetitionStatusAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="OPEN" />
                      <button
                        type="submit"
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-100"
                      >
                        Reopen
                      </button>
                    </form>
                    <form action={updatePetitionStatusAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="ARCHIVED" />
                      <button
                        type="submit"
                        className="rounded-lg border border-[var(--border)] bg-[var(--section-light)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--muted)]/20"
                      >
                        Archive
                      </button>
                    </form>
                  </>
                ) : null}
                {p.status === "ARCHIVED" ? (
                  <form action={updatePetitionStatusAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value="CLOSED" />
                    <button
                      type="submit"
                      className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--section-light)]"
                      title="Restore as closed (visible but no new signatures); reopen from there if needed."
                    >
                      Un-archive (closed)
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
