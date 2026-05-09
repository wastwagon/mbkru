import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MemberAuthUnavailable } from "@/components/member/MemberAuthUnavailable";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";
import { safePostAuthRedirectPath } from "@/lib/member/safe-post-auth-redirect";
import { getMemberSession } from "@/lib/member/session";
import { MemberRegisterForm } from "./MemberRegisterForm";

export async function generateMetadata(): Promise<Metadata> {
  if (!isMemberAuthEnabled()) {
    return { title: "Create account", robots: { index: false, follow: true } };
  }
  return { title: "Create account" };
}

type RegisterPageProps = { searchParams?: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  if (!isMemberAuthEnabled()) return <MemberAuthUnavailable variant="register" />;
  const sp = (await searchParams) ?? {};
  if (await getMemberSession()) {
    redirect(safePostAuthRedirectPath(sp.next, "/account"));
  }

  return (
    <div>
      <PageHeader
        title="Create account"
        description="Register for a public MBKRU member account for MBKRU Voice and related tools."
      />
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">Loading…</p>}>
              <MemberRegisterForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
