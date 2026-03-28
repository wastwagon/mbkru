import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";
import { getMemberSession } from "@/lib/member/session";
import { MemberLoginForm } from "./MemberLoginForm";

export default async function LoginPage() {
  if (!isMemberAuthEnabled()) notFound();
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
