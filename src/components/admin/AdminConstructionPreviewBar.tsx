import Link from "next/link";

import { getAdminSession } from "@/lib/admin/session";
import { isPublicSiteUnderConstruction } from "@/lib/server/site-config";

/** Shown when an admin previews the live site while public under-construction mode is on. */
export async function AdminConstructionPreviewBar() {
  const [session, underConstruction] = await Promise.all([getAdminSession(), isPublicSiteUnderConstruction()]);
  if (!session || !underConstruction) return null;

  return (
    <div
      className="border-b border-amber-300/80 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950"
      role="status"
    >
      <span className="font-semibold">Admin preview</span>
      <span className="mx-2 text-amber-800/70" aria-hidden>
        ·
      </span>
      Public visitors see the under-construction page. Members and community users are gated too.
      <span className="mx-2 text-amber-800/70" aria-hidden>
        ·
      </span>
      <Link href="/admin/settings" className="font-semibold underline underline-offset-2">
        Change in Settings
      </Link>
    </div>
  );
}
