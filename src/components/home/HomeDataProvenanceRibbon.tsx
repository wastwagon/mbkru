import Link from "next/link";

import { primaryLinkClass } from "@/lib/primary-link-styles";
import { ghanaPublicDataAuthorityLinks } from "@/lib/public-data-authority-links";

/** Compact homepage strip: where public figures come from + link to full provenance. */
export function HomeDataProvenanceRibbon() {
  return (
    <aside className="border-b border-[var(--border)] bg-[var(--section-light)]/80 py-3 text-[11px] leading-relaxed text-[var(--muted-foreground)] sm:py-3.5 sm:text-xs">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:max-w-6xl lg:px-8">
        <span className="font-semibold text-[var(--foreground)]">Data &amp; provenance</span>
        {" — "}
        Regional and roster figures on this site follow published sources listed on{" "}
        <Link
          href="/data-sources"
          className={`${primaryLinkClass} transition-colors duration-200 hover:text-[var(--primary-dark)]`}
        >
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
              className={`${primaryLinkClass} transition-colors duration-200 hover:text-[var(--primary-dark)]`}
            >
              {item.label}
            </a>
          </span>
        ))}
        .
      </div>
    </aside>
  );
}
