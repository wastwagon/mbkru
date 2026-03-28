import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

type Props = { variant: "login" | "register" };

/**
 * Shown when `NEXT_PUBLIC_PLATFORM_PHASE` &lt; 2 at build — avoids confusing 404 on /login and /register.
 */
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
            <strong>Member sign-in is not enabled on this deployment.</strong> The site was built with{" "}
            <strong>Phase 1</strong> settings, so marketing and previews work, but{" "}
            <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm">/login</code> and{" "}
            <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm">/register</code> stay off until the next
            production build.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <strong className="text-[var(--foreground)]">Operators (Coolify / Docker):</strong> set build argument{" "}
            <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">NEXT_PUBLIC_PLATFORM_PHASE=2</code> (or{" "}
            <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">3</code>), set{" "}
            <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">MEMBER_SESSION_SECRET</code> (≥32 chars), then{" "}
            <strong>rebuild</strong> the image — <code className="text-xs">NEXT_PUBLIC_*</code> is baked in at build time.
          </p>
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
