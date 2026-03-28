import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";
import { getMemberSession } from "@/lib/member/session";
import { MemberRegisterForm } from "./MemberRegisterForm";

export default async function RegisterPage() {
  if (!isMemberAuthEnabled()) notFound();
  if (await getMemberSession()) redirect("/account");

  return (
    <div>
      <PageHeader
        title="Create account"
        description="Register for a public MBKRU member account (Phase 2). You will use this for MBKRU Voice and related tools as they roll out."
      />
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <MemberRegisterForm />
        </div>
      </section>
    </div>
  );
}
