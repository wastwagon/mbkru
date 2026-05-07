import Link from "next/link";

import { primaryLinkClass } from "@/lib/primary-link-styles";

/**
 * Consistent return link to the admin dashboard (`/admin`).
 */
export function AdminBackLink() {
  return (
    <Link href="/admin" className={primaryLinkClass}>
      ← Back to dashboard
    </Link>
  );
}
