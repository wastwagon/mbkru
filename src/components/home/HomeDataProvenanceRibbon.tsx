import Link from "next/link";

import { ghanaPublicDataAuthorityLinks } from "@/lib/public-data-authority-links";

/** Compact homepage strip: where public figures come from + link to full provenance. */
export function HomeDataProvenanceRibbon() {
  return (
    <aside className="border-b border-[var(--border)] bg-[var(--section-light)]/70 py-2.5 text-center text-[11px] leading-relaxed text-[var(--muted-foreground)] sm:text-xs">
      <span className="font-semibold text-[var(--foreground)]">Data &amp; provenance</span>
      {" — "}
      Regional and roster figures on this site follow published sources listed on{" "}
      <Link href="/data-sources" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
        Data sources
      </Link>
      . Key national references:{" "}
      {ghanaPublicDataAuthorityLinks.map((item, i) => (
        <span key={item.href}>
          {i > 0 ? " · " : null}
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--primary)] underline-offset-2 hover:underline"
          >
            {item.label}
          </a>
        </span>
      ))}
      .
    </aside>
  );
}
