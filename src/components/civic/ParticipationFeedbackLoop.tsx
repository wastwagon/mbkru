import Link from "next/link";

import { primaryLinkClass } from "@/lib/primary-link-styles";

const STEPS = [
  {
    step: "1",
    title: "Submit",
    body: "File through MBKRU Voice with evidence. Save your tracking code — it is your receipt.",
  },
  {
    step: "2",
    title: "Acknowledged",
    body: "Programme staff triage and route your report. This is not a regulator or court filing.",
  },
  {
    step: "3",
    title: "Updates",
    body: "Status changes appear when you track your code or in your member account.",
  },
  {
    step: "4",
    title: "Outcome",
    body: "Some reports inform public aggregates or causes. We explain limits in methodology.",
  },
] as const;

/**
 * UNDP / SeeClickFix-style participation loop — plain language, visible next steps (civic tech best practice).
 */
export function ParticipationFeedbackLoop({ className = "" }: { className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 ${className}`.trim()}
      aria-labelledby="participation-loop-heading"
    >
      <h2 id="participation-loop-heading" className="font-display text-base font-bold text-[var(--foreground)] sm:text-lg">
        What happens after you participate
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-secondary)]">
        Nothing goes into a black box. Track progress with your code or sign in to your account.{" "}
        <Link href="/methodology" className={primaryLinkClass}>
          How we handle reports
        </Link>
      </p>
      <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((item) => (
          <li key={item.step} className="flex gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15 text-sm font-bold text-[var(--primary)]"
              aria-hidden
            >
              {item.step}
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-secondary)]">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-xs text-[var(--foreground-secondary)]">
        <Link href="/track-report" className={`font-semibold ${primaryLinkClass}`}>
          Track a report
        </Link>
        {" · "}
        <Link href="/contact" className={primaryLinkClass}>
          Contact programme staff
        </Link>
      </p>
    </section>
  );
}
