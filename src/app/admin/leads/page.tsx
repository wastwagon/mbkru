import Link from "next/link";

import type { LeadCaptureSource } from "@prisma/client";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

const SOURCE_TABS: { param: string; label: string; source?: LeadCaptureSource }[] = [
  { param: "", label: "All" },
  { param: "PARLIAMENT_TRACKER", label: "Parliament tracker", source: "PARLIAMENT_TRACKER" },
  { param: "NEWSLETTER", label: "Newsletter", source: "NEWSLETTER" },
  { param: "EARLY_ACCESS", label: "Early access", source: "EARLY_ACCESS" },
];

function parseSource(raw: string | string[] | undefined): LeadCaptureSource | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return undefined;
  const allowed: LeadCaptureSource[] = ["PARLIAMENT_TRACKER", "NEWSLETTER", "EARLY_ACCESS"];
  return allowed.includes(v as LeadCaptureSource) ? (v as LeadCaptureSource) : undefined;
}

type Props = { searchParams?: Promise<{ source?: string | string[] }> };

export default async function AdminLeadsPage({ searchParams }: Props) {
  await requireAdminSession();

  const sp = (await searchParams) ?? {};
  const sourceFilter = parseSource(sp.source);

  const leads = await prisma.leadCapture.findMany({
    where: sourceFilter ? { source: sourceFilter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const counts = await prisma.leadCapture.groupBy({
    by: ["source"],
    _count: { id: true },
  });
  const countBySource = Object.fromEntries(counts.map((c) => [c.source, c._count.id])) as Partial<
    Record<LeadCaptureSource, number>
  >;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Lead capture</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Newsletter, early access, and Parliament tracker waitlist signups (deduplicated by email per source). Use for
        pilot notifications and exports.{" "}
        <Link href="/admin/contact-submissions" className="text-[var(--primary)] hover:underline">
          Contact form messages
        </Link>{" "}
        are stored separately (full text, append-only).
      </p>

      <ul className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted-foreground)]">
        <li>
          Tracker:{" "}
          <span className="font-mono text-[var(--foreground)]">
            {countBySource.PARLIAMENT_TRACKER ?? 0}
          </span>
        </li>
        <li>
          Newsletter:{" "}
          <span className="font-mono text-[var(--foreground)]">{countBySource.NEWSLETTER ?? 0}</span>
        </li>
        <li>
          Early access:{" "}
          <span className="font-mono text-[var(--foreground)]">{countBySource.EARLY_ACCESS ?? 0}</span>
        </li>
      </ul>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by signup source">
        {SOURCE_TABS.map((t) => {
          const active =
            (t.param === "" && !sourceFilter) || (t.source !== undefined && t.source === sourceFilter);
          const href = t.param ? `/admin/leads?source=${encodeURIComponent(t.param)}` : "/admin/leads";
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

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--section-light)]/80 text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Signed up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                  No rows for this filter.
                </td>
              </tr>
            ) : (
              leads.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--section-light)]/40">
                  <td className="px-4 py-3 font-mono text-xs sm:text-sm">{row.email}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {row.source.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {row.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className="text-[var(--primary)] hover:underline">
          ← Dashboard
        </Link>
      </p>
    </div>
  );
}
