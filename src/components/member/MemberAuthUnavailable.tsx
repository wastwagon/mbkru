import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

type Props = { variant: "login" | "register" };

/** Shown when member auth routes are disabled for this deployment (Phase 1-style build). */
export function MemberAuthUnavailable({ variant }: Props) {
  const title = variant === "login" ? "Sign in" : "Create account";

  return (
    <div>
      <PageHeader
        title={title}
        description="Public member accounts power MBKRU Voice — submit reports, track a code, and manage your profile."
      />
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <p className="text-[var(--foreground)] leading-relaxed">
            <strong>Member sign-in is not available on this site yet.</strong> This deployment is in{" "}
            <strong>Phase 1</strong> mode (public information and contact). Accounts and MBKRU Voice open when the
            programme turns on later phases on this domain.
          </p>
          <details className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--section-light)]/60 px-4 py-3 text-sm">
            <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
              Technical notes for site operators
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
              Enable Phase 2 (or 3) at build time, set a member session secret (32+ random characters), then rebuild the
              web image so visitor-facing flags and Voice routes match —{" "}
              <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">NEXT_PUBLIC_PLATFORM_PHASE</code>,{" "}
              <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">MEMBER_SESSION_SECRET</code>, and other{" "}
              <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">NEXT_PUBLIC_*</code> values are fixed at
              build time.
            </p>
          </details>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            <li>
              <Link href="/citizens-voice" className="font-medium text-[var(--primary)] hover:underline">
                MBKRU Voice
              </Link>{" "}
              — how reporting works when your phase is turned on.
            </li>
            <li>
              <Link href="/contact" className="font-medium text-[var(--primary)] hover:underline">
                Contact
              </Link>{" "}
              — reach the team if you need help with access.
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/">Back to home</Button>
            <Button href="/citizens-voice" variant="outline">
              MBKRU Voice
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
