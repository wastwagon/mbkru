import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { MemberAuthUnavailable } from "@/components/member/MemberAuthUnavailable";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";

import { ForgotPasswordForm } from "./ForgotPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Forgot password", robots: { index: false, follow: true } };
}

export default function ForgotPasswordPage() {
  if (!isMemberAuthEnabled()) return <MemberAuthUnavailable variant="login" />;

  return (
    <div>
      <PageHeader title="Forgot password" description="Reset your MBKRU member account password." />
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </section>
    </div>
  );
}
