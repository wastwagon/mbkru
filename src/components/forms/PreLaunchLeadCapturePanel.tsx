import type { ReactNode } from "react";

import { PreLaunchLeadCaptureFormSlot } from "@/components/forms/PreLaunchLeadCaptureFormSlot";

type Variant = "early-access" | "tracker";

type Props = {
  variant: Variant;
  eyebrow: string;
  title: string;
  description: string;
  /** Optional links row (tracker variant). */
  children?: ReactNode;
};

/** Pre-phase-4 waitlist surfaces only — not shown when `publicLaunchPolish` is on. */
export function PreLaunchLeadCapturePanel({ variant, eyebrow, title, description, children }: Props) {
  return (
    <section className="section-spacing section-full bg-[var(--section-light)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[var(--primary)]/20 bg-[var(--card)] shadow-[var(--shadow-card)]">
          <div className="bg-gradient-to-r from-[var(--primary)]/5 via-[var(--card)] to-[var(--primary)]/5 px-6 py-8 sm:p-10">
            <span className="inline-block rounded-full bg-[var(--primary)]/10 px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
              {eyebrow}
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-[var(--foreground)] sm:text-3xl">{title}</h2>
            <p className="mt-2 text-[var(--foreground-secondary)]">{description}</p>
            {children}
            <PreLaunchLeadCaptureFormSlot variant={variant} />
          </div>
        </div>
      </div>
    </section>
  );
}
