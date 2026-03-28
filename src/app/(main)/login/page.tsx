import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MemberAuthUnavailable } from "@/components/member/MemberAuthUnavailable";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";
import { getMemberSession } from "@/lib/member/session";
import { MemberLoginForm } from "./MemberLoginForm";

export async function generateMetadata(): Promise<Metadata> {
  if (!isMemberAuthEnabled()) {
    return { title: "Sign in", robots: { index: false, follow: true } };
  }
  return { title: "Sign in" };
}

export default async function LoginPage() {
  if (!isMemberAuthEnabled()) return <MemberAuthUnavailable variant="login" />;
  if (await getMemberSession()) redirect("/account");

  return (
    <div>
      <PageHeader
        title="Sign in"
        description="Access your MBKRU member account. This is separate from the admin CMS login."
      />
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">Loading…</p>}>
            <MemberLoginForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
