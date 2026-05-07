import { DatabaseMaintenancePanel } from "@/app/admin/settings/DatabaseMaintenancePanel";
import { PetitionPendingCleanupPanel } from "@/app/admin/settings/PetitionPendingCleanupPanel";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminSettingsPage() {
  await requireAdminSession();

  return (
    <AdminPageContainer width="narrow">
      <AdminPageHeader
        title="Settings"
        description="Run database maintenance when deploy-time migrate or seed did not complete successfully."
      />

      <DatabaseMaintenancePanel />

      <PetitionPendingCleanupPanel />

      <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
        Only signed-in admins can run these commands. Keep production{" "}
        <code className="rounded bg-[var(--muted)] px-1">ADMIN_EMAIL</code>,{" "}
        <code className="rounded bg-[var(--muted)] px-1">ADMIN_PASSWORD</code>, and{" "}
        <code className="rounded bg-[var(--muted)] px-1">ADMIN_SESSION_SECRET</code> secret.
      </p>
    </AdminPageContainer>
  );
}
