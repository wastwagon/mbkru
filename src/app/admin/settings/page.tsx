import Link from "next/link";

import { DatabaseMaintenancePanel } from "@/app/admin/settings/DatabaseMaintenancePanel";
import { PetitionPendingCleanupPanel } from "@/app/admin/settings/PetitionPendingCleanupPanel";
import { requireAdminSession } from "@/lib/admin/require-session";

export default async function AdminSettingsPage() {
  await requireAdminSession();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Database maintenance when deploy-time migrate or seed did not succeed.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Admin home
        </Link>
      </div>

      <DatabaseMaintenancePanel />

      <PetitionPendingCleanupPanel />

      <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
        Only signed-in admins can run these commands. Keep production{" "}
        <code className="rounded bg-[var(--muted)] px-1">ADMIN_EMAIL</code>,{" "}
        <code className="rounded bg-[var(--muted)] px-1">ADMIN_PASSWORD</code>, and{" "}
        <code className="rounded bg-[var(--muted)] px-1">ADMIN_SESSION_SECRET</code> secret.
      </p>
    </div>
  );
}
