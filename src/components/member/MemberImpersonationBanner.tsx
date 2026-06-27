import { getMemberSession } from "@/lib/member/session";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export async function MemberImpersonationBanner() {
  const session = await getMemberSession();
  if (!session?.impersonatedByAdminId) return null;

  const endHref = `/api/admin/impersonate/end?next=${encodeURIComponent("/admin/communities")}`;

  return (
    <div
      className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
      role="status"
    >
      <strong>Support mode:</strong> you are signed in as <span className="font-mono">{session.email}</span>.{" "}
      <a href={endHref} className={`${primaryLinkClass} font-semibold`}>
        End support session
      </a>
    </div>
  );
}
