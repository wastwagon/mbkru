import { notFound, redirect } from "next/navigation";
import { isMemberAuthEnabled } from "@/lib/member/phase-gate";
import { getMemberSession } from "@/lib/member/session";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!isMemberAuthEnabled()) notFound();
  const session = await getMemberSession();
  if (!session) redirect("/login?next=/account");

  return <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">{children}</div>;
}
