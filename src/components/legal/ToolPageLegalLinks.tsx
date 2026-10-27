import Link from "next/link";

import { primaryLinkClass } from "@/lib/primary-link-styles";

/** Shared methodology + terms row for tool pages (phase 1–3 verbose disclaimers). */
export function ToolPageLegalLinks({ className = "mt-3 text-xs" }: { className?: string }) {
  return (
    <p className={className}>
      <Link href="/methodology#claims-and-citations" className={primaryLinkClass}>
        Claims &amp; limitations
      </Link>
      {" · "}
      <Link href="/terms" className={primaryLinkClass}>
        Terms of Use
      </Link>
    </p>
  );
}
