import Link from "next/link";

import {
  createReportCardCycleAction,
  publishReportCardCycleAction,
  unpublishReportCardCycleAction,
} from "@/app/admin/report-card/actions";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminListPanel } from "@/components/admin/AdminListPanel";
import { requireAdminSession } from "@/lib/admin/require-session";
import { adminQueueActionNeutralClass, adminSuccessButtonClass } from "@/lib/admin/admin-ui-classes";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { prisma } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { reportCardPublicVersusStoredLabel } from "@/lib/report-card-public-label";

export default async function AdminReportCardPage() {
  await requireAdminSession();

  const cycles = await prisma.reportCardCycle.findMany({
    orderBy: { year: "desc" },
    include: { _count: { select: { entries: true } } },
  });

  return (
    <AdminPageContainer width="narrow">
      <AdminPageHeader
        title="People's Report Card"
        description={
          <>
            Create a cycle per year, add scorecard rows per MP or minister, then publish when ready. The public site
            lists only published cycles when the feature is enabled. Partner read API:{" "}
            <code className="rounded bg-[var(--section-light)] px-1 text-xs">GET /api/report-card/[year]</code>.
          </>
        }
      />

      <section id="new-cycle" className="mt-2 rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">New cycle</h2>
        <form action={createReportCardCycleAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <FormField label="Year" htmlFor="year">
            <Input id="year" name="year" type="number" required min={1992} max={2100} density="admin" />
          </FormField>
          <FormField
            label="Label"
            htmlFor="label"
            className="sm:col-span-2"
            hint={
              <>
                Shown on the public site unless it looks like internal scaffolding (pilot, layout workflow, etc.) — then
                visitors see &quot;People&apos;s Report Card [year]&quot; instead.
              </>
            }
          >
            <Input
              id="label"
              name="label"
              required
              maxLength={200}
              placeholder="e.g. 2026 mid-term snapshot"
              density="admin"
            />
          </FormField>
          <FormField label="Methodology notes" htmlFor="methodology" optional className="sm:col-span-2">
            <Textarea id="methodology" name="methodology" rows={3} maxLength={100000} density="admin" />
          </FormField>
          <div className="sm:col-span-2">
            <Button type="submit" density="admin">
              Create cycle
            </Button>
          </div>
        </form>
      </section>

      <AdminListPanel className="mt-10">
        {cycles.length === 0 ? (
          <li className="p-6">
            <AdminEmptyState
              title="No cycles yet"
              message="Create a cycle above to start adding scorecard entries."
              action={{ href: "#new-cycle", label: "Create a cycle" }}
            />
          </li>
        ) : (
          cycles.map((c) => {
            const { publicTitle, storedLabel, showStoredLine } = reportCardPublicVersusStoredLabel(c.year, c.label);
            return (
            <li key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--foreground)]">
                  {c.year} — {publicTitle}
                  {showStoredLine ? (
                    <span className="ml-2 font-normal text-[var(--foreground-secondary)]">(public title)</span>
                  ) : null}
                </p>
                {showStoredLine ? (
                  <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                    Stored label:{" "}
                    <span className="font-mono text-[var(--foreground)]">{storedLabel.length > 0 ? storedLabel : "(empty)"}</span>
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                  {c._count.entries} entr{c._count.entries === 1 ? "y" : "ies"}
                  {c.publishedAt ? (
                    <>
                      {" "}
                      · <span className="text-green-700">Published</span>{" "}
                      {c.publishedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                    </>
                  ) : (
                    <> · <span className="text-amber-700">Draft</span></>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/report-card/${c.id}`} className={`${primaryNavLinkClass} text-sm font-semibold`}>
                  Edit entries
                </Link>
                {c.publishedAt ? (
                  <form action={unpublishReportCardCycleAction}>
                    <input type="hidden" name="cycleId" value={c.id} />
                    <button
                      type="submit"
                      className={adminQueueActionNeutralClass}
                    >
                      Unpublish
                    </button>
                  </form>
                ) : (
                  <form action={publishReportCardCycleAction}>
                    <input type="hidden" name="cycleId" value={c.id} />
                    <button
                      type="submit"
                      className={adminSuccessButtonClass}
                    >
                      Publish
                    </button>
                  </form>
                )}
              </div>
            </li>
            );
          })
        )}
      </AdminListPanel>
    </AdminPageContainer>
  );
}
