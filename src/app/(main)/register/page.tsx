import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { MemberAuthUnavailable } from "@/components/member/MemberAuthUnavailable";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";
import { getMemberSession } from "@/lib/member/session";
import { MemberRegisterForm } from "./MemberRegisterForm";

export async function generateMetadata(): Promise<Metadata> {
  if (!isMemberAuthEnabled()) {
    return { title: "Create account", robots: { index: false, follow: true } };
  }
  return { title: "Create account" };
}

export default async function RegisterPage() {
  if (!isMemberAuthEnabled()) return <MemberAuthUnavailable variant="register" />;
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
