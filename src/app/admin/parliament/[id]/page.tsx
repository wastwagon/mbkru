import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createCampaignPromiseAction,
  updateCampaignPromiseEvidenceAction,
  updateCampaignPromiseStatusAction,
} from "@/app/admin/parliament/actions";
import {
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { POLICY_SECTOR_LABELS, POLICY_SECTOR_VALUES } from "@/lib/promise-policy-sectors";

import type { PromiseStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: PromiseStatus; label: string }[] = [
  { value: "TRACKING", label: "Tracking" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "BROKEN", label: "Broken" },
  { value: "DEFERRED", label: "Deferred" },
];

type Props = { params: Promise<{ id: string }> };

export default async function AdminParliamentMemberPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const [member, manifestos] = await Promise.all([
    prisma.parliamentMember.findUnique({
      where: { id },
      include: {
        constituency: true,
        promises: {
          orderBy: { updatedAt: "desc" },
          include: { manifestoDocument: { select: { id: true, title: true, sourceUrl: true } } },
        },
      },
    }),
    prisma.manifestoDocument.findMany({
      orderBy: [{ electionCycle: "desc" }, { partySlug: "asc" }, { title: "asc" }],
      select: { id: true, title: true, partySlug: true, electionCycle: true },
    }),
  ]);

  if (!member) notFound();

  return (
    <AdminPageContainer width="form">
      <AdminPageHeader
        showDashboardBack={false}
        title={member.name}
        backSlot={
          <Link href="/admin/parliament" className={primaryLinkClass}>
            {accountabilityProse.adminParliamentListBackLink}
          </Link>
        }
      />
      <dl className="mt-2 grid gap-1 text-sm text-[var(--muted-foreground)]">
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Slug: </dt>
          <dd className="inline font-mono">{member.slug}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Role: </dt>
          <dd className="inline">{member.role}</dd>
        </div>
        {member.party ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Party: </dt>
            <dd className="inline">{member.party}</dd>
          </div>
        ) : null}
        {member.constituency ? (
          <div>
            <dt className="inline font-medium text-[var(--foreground)]">Constituency: </dt>
            <dd className="inline">{member.constituency.name}</dd>
          </div>
        ) : null}
        <div>
          <dt className="inline font-medium text-[var(--foreground)]">Active: </dt>
          <dd className="inline">{member.active ? "Yes" : "No"}</dd>
        </div>
      </dl>

      <section className="mt-10 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">{accountabilityProse.adminAddPromiseHeading}</h2>
        <form action={createCampaignPromiseAction} className="mt-4 space-y-3">
          <input type="hidden" name="memberId" value={member.id} />
          <div>
            <label htmlFor="title" className="block text-xs font-medium text-[var(--foreground)]">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              minLength={3}
              maxLength={500}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-xs font-medium text-[var(--foreground)]">
              Description <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={50000}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sourceLabel" className="block text-xs font-medium text-[var(--foreground)]">
              Source (e.g. manifesto page, speech date)
            </label>
            <input
              id="sourceLabel"
              name="sourceLabel"
              required
              maxLength={200}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sourceDate" className="block text-xs font-medium text-[var(--foreground)]">
              Source date <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <input
              id="sourceDate"
              name="sourceDate"
              type="date"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm sm:max-w-xs"
            />
          </div>
          <div>
            <label htmlFor="sourceUrl" className="block text-xs font-medium text-[var(--foreground)]">
              Primary source URL <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              inputMode="url"
              placeholder="https://…"
              maxLength={2000}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
            <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">
              Public “Source” button; if empty, the linked manifesto document URL is used when set.
            </p>
          </div>
          <div>
            <label htmlFor="verificationNotes" className="block text-xs font-medium text-[var(--foreground)]">
              Verification & impact notes <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <textarea
              id="verificationNotes"
              name="verificationNotes"
              rows={4}
              maxLength={50000}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-[var(--foreground)]">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="TRACKING"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm sm:max-w-xs"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="policySector" className="block text-xs font-medium text-[var(--foreground)]">
              Policy category <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <select
              id="policySector"
              name="policySector"
              defaultValue=""
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm sm:max-w-xs"
            >
              <option value="">— None —</option>
              {POLICY_SECTOR_VALUES.map((v) => (
                <option key={v} value={v}>
                  {POLICY_SECTOR_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="partySlug" className="block text-xs font-medium text-[var(--foreground)]">
                Party slug <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
              </label>
              <input
                id="partySlug"
                name="partySlug"
                maxLength={120}
                placeholder="e.g. ndc"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="electionCycle" className="block text-xs font-medium text-[var(--foreground)]">
                Election cycle <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
              </label>
              <input
                id="electionCycle"
                name="electionCycle"
                maxLength={100}
                placeholder="e.g. 2024"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="manifestoDocumentId" className="block text-xs font-medium text-[var(--foreground)]">
              Manifesto document <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <select
              id="manifestoDocumentId"
              name="manifestoDocumentId"
              defaultValue=""
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            >
              <option value="">— None —</option>
              {manifestos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.partySlug} · {m.electionCycle})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="manifestoPageRef" className="block text-xs font-medium text-[var(--foreground)]">
              Manifesto page ref <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
            </label>
            <input
              id="manifestoPageRef"
              name="manifestoPageRef"
              maxLength={200}
              placeholder="e.g. p. 42, section 3"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isGovernmentProgramme"
              name="isGovernmentProgramme"
              type="checkbox"
              value="on"
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            <label htmlFor="isGovernmentProgramme" className="text-sm text-[var(--foreground)]">
              Mark as government programme / executive commitment
            </label>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
            {accountabilityProse.adminCreateGovernmentTagHint}
          </p>
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            {accountabilityProse.adminCreateCatalogueRowButton}
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          {accountabilityProse.adminMemberCatalogueSectionHeading}
        </h2>
        {member.promises.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {accountabilityProse.adminMemberCatalogueEmpty}
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {member.promises.map((p) => (
              <li key={p.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="font-medium text-[var(--foreground)]">{p.title}</p>
                {p.description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
                    {p.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {p.sourceLabel}
                  {p.sourceDate
                    ? ` · ${p.sourceDate.toLocaleDateString("en-GB", { dateStyle: "medium" })}`
                    : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {p.isGovernmentProgramme ? (
                    <span className="rounded-full bg-[var(--section-light)] px-2 py-0.5 font-medium text-[var(--foreground)]">
                      Government programme
                    </span>
                  ) : null}
                  {p.partySlug ? (
                    <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--muted-foreground)]">
                      Party: {p.partySlug}
                    </span>
                  ) : null}
                  {p.electionCycle ? (
                    <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--muted-foreground)]">
                      Cycle: {p.electionCycle}
                    </span>
                  ) : null}
                  {p.manifestoDocument ? (
                    <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--muted-foreground)]">
                      Manifesto: {p.manifestoDocument.title}
                    </span>
                  ) : null}
                  {p.manifestoPageRef ? (
                    <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--muted-foreground)]">
                      Ref: {p.manifestoPageRef}
                    </span>
                  ) : null}
                </div>
                <form action={updateCampaignPromiseStatusAction} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="promiseId" value={p.id} />
                  <input type="hidden" name="memberId" value={member.id} />
                  <label htmlFor={`st-${p.id}`} className="sr-only">
                    Status for {p.title}
                  </label>
                  <select
                    id={`st-${p.id}`}
                    name="status"
                    defaultValue={p.status}
                    className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                  >
                    Update status
                  </button>
                </form>
                <form action={updateCampaignPromiseEvidenceAction} className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                  <input type="hidden" name="promiseId" value={p.id} />
                  <input type="hidden" name="memberId" value={member.id} />
                  <p className="text-xs font-semibold text-[var(--foreground)]">Source & verification (public)</p>
                  <div>
                    <label htmlFor={`src-label-${p.id}`} className="block text-[11px] font-medium text-[var(--foreground)]">
                      Source label
                    </label>
                    <input
                      id={`src-label-${p.id}`}
                      name="sourceLabel"
                      required
                      maxLength={200}
                      defaultValue={p.sourceLabel}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`src-url-${p.id}`} className="block text-[11px] font-medium text-[var(--foreground)]">
                      Primary source URL
                    </label>
                    <input
                      id={`src-url-${p.id}`}
                      name="sourceUrl"
                      type="url"
                      defaultValue={p.sourceUrl ?? ""}
                      placeholder="https://…"
                      maxLength={2000}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`ver-${p.id}`} className="block text-[11px] font-medium text-[var(--foreground)]">
                      Verification & impact notes
                    </label>
                    <textarea
                      id={`ver-${p.id}`}
                      name="verificationNotes"
                      rows={3}
                      maxLength={50000}
                      defaultValue={p.verificationNotes ?? ""}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`pol-${p.id}`} className="block text-[11px] font-medium text-[var(--foreground)]">
                      Policy category
                    </label>
                    <select
                      id={`pol-${p.id}`}
                      name="policySector"
                      defaultValue={p.policySector ?? ""}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                    >
                      <option value="">— None —</option>
                      {POLICY_SECTOR_VALUES.map((v) => (
                        <option key={v} value={v}>
                          {POLICY_SECTOR_LABELS[v]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id={`gov-flag-${p.id}`}
                      name="isGovernmentProgramme"
                      type="checkbox"
                      value="on"
                      defaultChecked={p.isGovernmentProgramme}
                      className="h-4 w-4 rounded border-[var(--border)]"
                    />
                    <label htmlFor={`gov-flag-${p.id}`} className="text-xs text-[var(--foreground)]">
                      Mark as government programme / executive commitment (public{" "}
                      {accountabilityCatalogueNavMedium.government} page)
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium hover:bg-[var(--section-light)]"
                  >
                    Save source & verification
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminPageContainer>
  );
}
