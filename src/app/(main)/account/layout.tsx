import { notFound, redirect } from "next/navigation";

import { AccountSidebar } from "@/components/account/AccountSidebar";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";
import { getMemberSession } from "@/lib/member/session";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!isMemberAuthEnabled()) notFound();
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/account");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <AccountSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
