import { notFound, redirect } from "next/navigation";

import { AccountSidebar } from "@/components/account/AccountSidebar";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";
import { getMemberSession } from "@/lib/member/session";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!isMemberAuthEnabled()) notFound();
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/account");

  return (
    <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-10 lg:py-12">
      <div className="flex flex-col gap-9 lg:flex-row lg:gap-11">
        <AccountSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
