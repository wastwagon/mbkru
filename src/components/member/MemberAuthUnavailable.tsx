import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type Props = { variant: "login" | "register" };

/** Shown when member authentication is not enabled for this site. */
export function MemberAuthUnavailable({ variant }: Props) {
  const title = variant === "login" ? "Sign in" : "Create account";

  return (
    <div>
      <PageHeader
        title={title}
        description="Public member accounts power MBKRU Voice — submit reports, track a code, and manage your profile."
      />
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <p className="text-[var(--foreground)] leading-relaxed">
              <strong>Member sign-in is not available on this site yet.</strong> Public pages and contact stay open;
              accounts and MBKRU Voice reporting open when the programme enables them here.
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
              <li>
                <Link href="/citizens-voice" className={primaryLinkClass}>
                  MBKRU Voice
                </Link>{" "}
                — how reporting works and how membership fits the programme.
              </li>
              <li>
                <Link href="/contact" className={primaryLinkClass}>
                  Contact
                </Link>{" "}
                — reach the team if you need help with access.
              </li>
            </ul>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/" className="w-full justify-center sm:w-auto">
                Back to home
              </Button>
              <Button href="/citizens-voice" variant="outline" className="w-full justify-center sm:w-auto">
                MBKRU Voice
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
