import Link from "next/link";

import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

/** Reusable line for pages that want the floating assistant called out. */
export function MbkruVoiceCallout() {
  return (
    <aside
      className="mt-6 rounded-2xl border border-[var(--primary)]/25 bg-gradient-to-r from-[var(--primary)]/[0.07] to-[var(--accent-gold)]/[0.08] p-4 sm:p-5"
      aria-label="MBKRU Voice assistant"
    >
      <p className="text-sm font-bold uppercase tracking-wide text-[var(--primary)]">MBKRU Voice</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)] sm:text-[15px]">
        Open the <strong>chat</strong> button in the <strong>lower-right corner</strong> of this page to ask questions
        about MBKRU, the diaspora hub, and our tools. You can type or use voice options from the{" "}
        <Link href="/accessibility" className={`font-semibold ${primaryLinkClass} ${focusRingSmClass}`}>
          accessibility
        </Link>{" "}
        page. For official ID or passport rules, we signpost to government sites.
      </p>
    </aside>
  );
}
