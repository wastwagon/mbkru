import { DatabaseMaintenancePanel } from "@/app/admin/settings/DatabaseMaintenancePanel";
import { PetitionPendingCleanupPanel } from "@/app/admin/settings/PetitionPendingCleanupPanel";
import { SiteVisibilityPanel } from "@/app/admin/settings/SiteVisibilityPanel";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminSettingsPage() {
  await requireAdminSession();

  return (
    <AdminPageContainer width="narrow">
      <AdminPageHeader
        title="Settings"
        description="Site visibility, database maintenance, and operational tools."
      />

      <p className="mt-4 text-sm text-[var(--foreground-secondary)]">
        Multi-admin access: <a className="underline text-[var(--primary)]" href="/admin/operators">Operators</a>
        {" · "}
        Region reference data: <a className="underline text-[var(--primary)]" href="/admin/regions">Regions</a>
      </p>

      <SiteVisibilityPanel />

      <DatabaseMaintenancePanel />

      <PetitionPendingCleanupPanel />

      <p className="mt-8 text-center text-xs text-[var(--foreground-secondary)]">
        Only signed-in admins can run these commands. Keep production{" "}
        <code className="rounded bg-[var(--muted)] px-1">ADMIN_EMAIL</code>,{" "}
        <code className="rounded bg-[var(--muted)] px-1">ADMIN_PASSWORD</code>, and{" "}
        <code className="rounded bg-[var(--muted)] px-1">ADMIN_SESSION_SECRET</code> secret.
      </p>
    </AdminPageContainer>
  );
}
