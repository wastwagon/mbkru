import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/ui/PageHeader";
import { MemberAuthUnavailable } from "@/components/member/MemberAuthUnavailable";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";

import { ResetPasswordForm } from "./ResetPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Reset password", robots: { index: false, follow: true } };
}

export default function ResetPasswordPage() {
  if (!isMemberAuthEnabled()) return <MemberAuthUnavailable variant="login" />;

  return (
    <div>
      <PageHeader title="Reset password" description="Choose a new password for your MBKRU member account." />
      <section className="section-spacing section-full bg-[var(--section-light)]">
        <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <Suspense fallback={<p className="text-sm text-[var(--foreground-secondary)]">Loading…</p>}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
