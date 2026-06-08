import Link from "next/link";

import { focusRingSmClass, primaryNavLinkClass } from "@/lib/primary-link-styles";

type Props = {
  slug: string;
  name: string;
  role: string;
  party: string | null;
  constituencyName: string | null;
  promiseCount: number;
};

export function MpCatalogueBrowseCard({
  slug,
  name,
  role,
  party,
  constituencyName,
  promiseCount,
}: Props) {
  const sheetHref = `/promises/${encodeURIComponent(slug)}`;
  const metaParts = [role, party, constituencyName].filter(Boolean);

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/35 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold leading-snug text-[var(--foreground)] sm:text-lg">
            <Link href={sheetHref} className="hover:text-[var(--primary)]" prefetch={false}>
              {name}
            </Link>
          </h2>
          {metaParts.length > 0 ? (
            <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{metaParts.join(" · ")}</p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full border border-[var(--accent-gold)]/35 bg-[var(--accent-gold-light)] px-3 py-1 text-sm font-semibold tabular-nums text-[var(--accent-gold)]">
          {promiseCount}
        </span>
      </div>
      <p className="mt-2 text-xs text-[var(--foreground-secondary)]">
        {promiseCount === 1 ? "Catalogue row tracked" : "Catalogue rows tracked"}
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/parliament-tracker" className={`text-xs font-medium ${primaryNavLinkClass}`} prefetch={false}>
          Parliament roster
        </Link>
        <Link
          href={sheetHref}
          className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`}
          prefetch={false}
        >
          Open commitment sheet
        </Link>
      </div>
    </article>
  );
}
