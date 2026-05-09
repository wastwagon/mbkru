import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MemberAuthUnavailable } from "@/components/member/MemberAuthUnavailable";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";
import { safePostAuthRedirectPath } from "@/lib/member/safe-post-auth-redirect";
import { getMemberSession } from "@/lib/member/session";
import { MemberLoginForm } from "./MemberLoginForm";

type Props = { searchParams?: Promise<{ next?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  if (!isMemberAuthEnabled()) {
    return { title: "Sign in", robots: { index: false, follow: true } };
  }
  return { title: "Sign in" };
}

export default async function LoginPage({ searchParams }: Props) {
  if (!isMemberAuthEnabled()) return <MemberAuthUnavailable variant="login" />;
  const sp = (await searchParams) ?? {};
  if (await getMemberSession()) {
    redirect(safePostAuthRedirectPath(sp.next, "/account"));
  }

  return (
    <div>
      <PageHeader
        title="Sign in"
        description="Access your MBKRU member account. This is separate from the admin CMS login."
      />
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">Loading…</p>}>
              <MemberLoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
