import Link from "next/link";

import { PreLaunchModeCallout } from "@/components/admin/PreLaunchModeCallout";
import { getLaunchReadiness, type LaunchCheckStatus } from "@/lib/server/launch-readiness";

const STATUS_META: Record<
  LaunchCheckStatus,
  { label: string; dot: string; text: string; badge: string }
> = {
  ok: {
    label: "Ready",
    dot: "bg-emerald-500",
    text: "text-emerald-800",
    badge: "border-emerald-200 bg-emerald-50",
  },
  warn: {
    label: "Attention",
    dot: "bg-amber-500",
    text: "text-amber-900",
    badge: "border-amber-200 bg-amber-50",
  },
  blocker: {
    label: "Blocker",
    dot: "bg-rose-500",
    text: "text-rose-900",
    badge: "border-rose-200 bg-rose-50",
  },
  manual: {
    label: "Manual sign-off",
    dot: "bg-slate-400",
    text: "text-slate-700",
    badge: "border-slate-200 bg-slate-50",
  },
};

/** Pre-launch checklist for admins — automatable checks + manual sign-off reminders. */
export async function LaunchReadinessPanel() {
  const readiness = await getLaunchReadiness();

  const summary = readiness.readyForLaunch
    ? "Ready to open the public site"
    : readiness.blockerCount > 0
      ? `${readiness.blockerCount} blocker(s) before launch`
      : readiness.underConstruction
        ? "Gate on — complete sign-offs, then launch"
        : `${readiness.warnCount + readiness.checks.filter((c) => c.status === "manual").length} item(s) before launch`;

  return (
    <div
      id="launch-readiness"
      className="mt-8 scroll-mt-24 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-[var(--foreground)]">Launch readiness</h2>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            readiness.readyForLaunch
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : readiness.blockerCount > 0
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {summary}
        </span>
      </div>

      {readiness.underConstruction ? <PreLaunchModeCallout /> : null}

      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-secondary)]">
        July 2026 member-review blockers. Keep the under-construction gate on until this panel is clear,
        then disable the gate in{" "}
        <a href="#site-visibility" className="font-medium text-[var(--primary)] underline">
          Site visibility
        </a>{" "}
        below.
      </p>

      <ul className="mt-6 space-y-3">
        {readiness.checks.map((check) => {
          const meta = STATUS_META[check.status];
          return (
            <li
              key={check.id}
              className={`flex items-start gap-3 rounded-xl border p-4 ${meta.badge}`}
            >
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className={`text-sm font-semibold ${meta.text}`}>
                    {check.href ? (
                      <Link href={check.href} className="hover:underline">
                        {check.label}
                      </Link>
                    ) : (
                      check.label
                    )}
                  </p>
                  <span className={`text-[11px] font-bold uppercase tracking-wide ${meta.text}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-secondary)]">
                  {check.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--section-light)]/60 p-4 text-xs leading-relaxed text-[var(--foreground-secondary)]">
        <p className="font-semibold text-[var(--foreground)]">Launch sequence</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Resolve blockers above (editorial, legal, Hubtel, backups).</li>
          <li>
            Record manual sign-offs on production:{" "}
            <code className="rounded bg-white px-1">LAUNCH_LEGAL_REVIEW_SIGNED_OFF=1</code>,{" "}
            <code className="rounded bg-white px-1">LAUNCH_BACKUP_DRILL_COMPLETE=1</code>
          </li>
          <li>Optional: <code className="rounded bg-white px-1">npm run ops:archive-training-reports -- --apply</code></li>
          <li>
            Turn off the gate in{" "}
            <a href="#site-visibility" className="font-medium text-[var(--primary)] underline">
              Site visibility
            </a>{" "}
            or <code className="rounded bg-white px-1">npm run ops:construction:off</code>
          </li>
          <li>Smoke-test as a logged-out visitor (not admin).</li>
        </ol>
      </div>

      <p className="mt-4 text-xs text-[var(--foreground-secondary)]">
        Checked {new Date(readiness.generatedAt).toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
