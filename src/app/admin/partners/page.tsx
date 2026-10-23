import type { PartnerCategory } from "@prisma/client";
import Link from "next/link";

import {
  createEndorsementAction,
  createLeadershipProfileAction,
  createPartnerAction,
  deleteEndorsementAction,
  deleteLeadershipProfileAction,
  deletePartnerAction,
  publishEndorsementAction,
  publishLeadershipProfileAction,
  publishPartnerAction,
  unpublishEndorsementAction,
  unpublishLeadershipProfileAction,
  unpublishPartnerAction,
  updateEndorsementAction,
  updateLeadershipProfileAction,
  updatePartnerAction,
} from "@/app/admin/partners/actions";
import { DeleteRowForm } from "@/app/admin/partners/DeleteRowForm";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminMediaField, type AdminMediaFieldValue } from "@/components/admin/AdminMediaField";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  adminQueueActionClass,
  adminQueueActionSuccessPublishClass,
} from "@/lib/admin/admin-ui-classes";
import { requireAdminSession } from "@/lib/admin/require-session";
import { partnerCategoryLabel } from "@/lib/content/partners-cms";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

const sectionClass = "mt-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5";
const rowClass = "rounded-xl border border-[var(--border)] bg-[var(--card)] p-4";
const editDetailsClass =
  "mt-3 rounded-lg border border-[var(--border)] bg-[var(--section-light)]/60 p-3";

const PARTNER_CATEGORIES: PartnerCategory[] = [
  "GOVERNMENT",
  "CIVIL_SOCIETY",
  "DEVELOPMENT",
  "FOUNDATION",
  "OTHER",
];

function toMediaFieldValue(
  media: { id: string; storagePath: string; filename: string; alt: string | null } | null,
): AdminMediaFieldValue | null {
  if (!media) return null;
  return { id: media.id, storagePath: media.storagePath, filename: media.filename, alt: media.alt };
}

function PublishToggle({
  publishedAt,
  id,
  publishAction,
  unpublishAction,
}: {
  publishedAt: Date | null;
  id: string;
  publishAction: (formData: FormData) => Promise<void>;
  unpublishAction: (formData: FormData) => Promise<void>;
}) {
  return publishedAt ? (
    <form action={unpublishAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={adminQueueActionClass}>
        Unpublish
      </button>
    </form>
  ) : (
    <form action={publishAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={adminQueueActionSuccessPublishClass}>
        Publish
      </button>
    </form>
  );
}

function PartnerFields({
  idPrefix,
  defaults,
}: {
  idPrefix: string;
  defaults?: {
    name: string;
    slug: string;
    category: PartnerCategory;
    websiteUrl: string;
    summary: string;
    sortOrder: number;
    logoMedia: AdminMediaFieldValue | null;
  };
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Name" htmlFor={`${idPrefix}-name`}>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            required
            minLength={2}
            maxLength={200}
            defaultValue={defaults?.name ?? ""}
            density="admin"
          />
        </FormField>
        <FormField label="Slug" htmlFor={`${idPrefix}-slug`} optional>
          <Input
            id={`${idPrefix}-slug`}
            name="slug"
            maxLength={140}
            placeholder="auto from name if empty"
            defaultValue={defaults?.slug ?? ""}
            density="admin"
          />
        </FormField>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Category" htmlFor={`${idPrefix}-category`}>
          <Select
            id={`${idPrefix}-category`}
            name="category"
            defaultValue={defaults?.category ?? "OTHER"}
            density="admin"
          >
            {PARTNER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {partnerCategoryLabel(c)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Sort order" htmlFor={`${idPrefix}-sortOrder`}>
          <Input
            id={`${idPrefix}-sortOrder`}
            name="sortOrder"
            type="number"
            min={0}
            max={999999}
            defaultValue={defaults?.sortOrder ?? 0}
            density="admin"
          />
        </FormField>
      </div>
      <FormField label="Website URL" htmlFor={`${idPrefix}-websiteUrl`} optional>
        <Input
          id={`${idPrefix}-websiteUrl`}
          name="websiteUrl"
          type="url"
          maxLength={500}
          placeholder="https://"
          defaultValue={defaults?.websiteUrl ?? ""}
          density="admin"
        />
      </FormField>
      <FormField label="Summary" htmlFor={`${idPrefix}-summary`} optional>
        <Textarea
          id={`${idPrefix}-summary`}
          name="summary"
          rows={2}
          maxLength={600}
          defaultValue={defaults?.summary ?? ""}
          density="admin"
        />
      </FormField>
      <AdminMediaField
        name="logoMediaId"
        label="Logo (optional)"
        help="Public library images only. A category label tile is shown when no logo is set."
        initial={defaults?.logoMedia ?? null}
      />
    </>
  );
}

function LeadershipFields({
  idPrefix,
  defaults,
}: {
  idPrefix: string;
  defaults?: {
    name: string;
    roleTitle: string;
    bio: string;
    sortOrder: number;
    portraitMedia: AdminMediaFieldValue | null;
  };
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Name" htmlFor={`${idPrefix}-name`}>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            required
            minLength={2}
            maxLength={200}
            defaultValue={defaults?.name ?? ""}
            density="admin"
          />
        </FormField>
        <FormField label="Role title" htmlFor={`${idPrefix}-roleTitle`}>
          <Input
            id={`${idPrefix}-roleTitle`}
            name="roleTitle"
            required
            minLength={2}
            maxLength={200}
            placeholder="e.g. National Coordinator"
            defaultValue={defaults?.roleTitle ?? ""}
            density="admin"
          />
        </FormField>
      </div>
      <FormField label="Bio" htmlFor={`${idPrefix}-bio`} optional>
        <Textarea
          id={`${idPrefix}-bio`}
          name="bio"
          rows={3}
          maxLength={10000}
          defaultValue={defaults?.bio ?? ""}
          density="admin"
        />
      </FormField>
      <FormField label="Sort order" htmlFor={`${idPrefix}-sortOrder`}>
        <Input
          id={`${idPrefix}-sortOrder`}
          name="sortOrder"
          type="number"
          min={0}
          max={999999}
          defaultValue={defaults?.sortOrder ?? 0}
          density="admin"
        />
      </FormField>
      <AdminMediaField
        name="portraitMediaId"
        label="Portrait (optional)"
        help="Public library images only — no stand-in photos."
        initial={defaults?.portraitMedia ?? null}
      />
    </>
  );
}

function EndorsementFields({
  idPrefix,
  defaults,
}: {
  idPrefix: string;
  defaults?: {
    quote: string;
    attributionName: string;
    attributionRole: string;
    sortOrder: number;
  };
}) {
  return (
    <>
      <FormField label="Quote" htmlFor={`${idPrefix}-quote`}>
        <Textarea
          id={`${idPrefix}-quote`}
          name="quote"
          required
          minLength={2}
          maxLength={800}
          rows={3}
          defaultValue={defaults?.quote ?? ""}
          density="admin"
        />
      </FormField>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Attribution name" htmlFor={`${idPrefix}-attributionName`}>
          <Input
            id={`${idPrefix}-attributionName`}
            name="attributionName"
            required
            minLength={2}
            maxLength={200}
            defaultValue={defaults?.attributionName ?? ""}
            density="admin"
          />
        </FormField>
        <FormField label="Attribution role" htmlFor={`${idPrefix}-attributionRole`} optional>
          <Input
            id={`${idPrefix}-attributionRole`}
            name="attributionRole"
            maxLength={200}
            defaultValue={defaults?.attributionRole ?? ""}
            density="admin"
          />
        </FormField>
      </div>
      <FormField label="Sort order" htmlFor={`${idPrefix}-sortOrder`}>
        <Input
          id={`${idPrefix}-sortOrder`}
          name="sortOrder"
          type="number"
          min={0}
          max={999999}
          defaultValue={defaults?.sortOrder ?? 0}
          density="admin"
        />
      </FormField>
    </>
  );
}

function PublishNowCheckbox() {
  return (
    <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
      <input type="checkbox" name="publishNow" className="rounded border-[var(--border)]" />
      Publish immediately
    </label>
  );
}

export default async function AdminPartnersPage() {
  await requireAdminSession();

  const [partners, leadership, endorsements] = await Promise.all([
    prisma.partner.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { logoMedia: { select: { id: true, storagePath: true, filename: true, alt: true } } },
    }),
    prisma.leadershipProfile.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { portraitMedia: { select: { id: true, storagePath: true, filename: true, alt: true } } },
    }),
    prisma.endorsement.findMany({
      orderBy: [{ sortOrder: "asc" }, { attributionName: "asc" }],
    }),
  ]);

  return (
    <AdminPageContainer width="form">
      <AdminPageHeader
        title="Partners & leadership"
        description={
          <>
            Manage the confirmed listings on the public{" "}
            <Link href="/partners" className={primaryLinkClass}>
              Partners
            </Link>{" "}
            and{" "}
            <Link href="/about" className={primaryLinkClass}>
              About
            </Link>{" "}
            pages. Drafts stay hidden until you publish.
          </>
        }
      />

      {/* ------------------------------ Partners ------------------------------ */}
      <section className={sectionClass}>
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add partner</h2>
        <form action={createPartnerAction} className="mt-4 space-y-3">
          <PartnerFields idPrefix="partner-new" />
          <PublishNowCheckbox />
          <Button type="submit" density="admin">
            Save partner
          </Button>
        </form>
      </section>

      <h2 className="mt-8 text-sm font-semibold text-[var(--foreground)]">
        Partners ({partners.length})
      </h2>
      <ul className="mt-4 space-y-3">
        {partners.length === 0 ? (
          <li>
            <AdminEmptyState message="No partners yet." />
          </li>
        ) : (
          partners.map((p) => (
            <li key={p.id} className={rowClass}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--foreground)]">{p.name}</p>
                  <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                    {partnerCategoryLabel(p.category)} · slug: <span className="font-mono">{p.slug}</span>
                    {p.logoMedia ? " · logo set" : " · no logo"}
                    {p.publishedAt ? (
                      <span className="text-emerald-700"> · published</span>
                    ) : (
                      <span> · draft</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PublishToggle
                    publishedAt={p.publishedAt}
                    id={p.id}
                    publishAction={publishPartnerAction}
                    unpublishAction={unpublishPartnerAction}
                  />
                  <DeleteRowForm
                    action={deletePartnerAction}
                    id={p.id}
                    confirmMessage="Delete this partner permanently?"
                  />
                </div>
              </div>
              <details className={editDetailsClass}>
                <summary className="cursor-pointer text-xs font-semibold text-[var(--primary)]">
                  Edit
                </summary>
                <form action={updatePartnerAction} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={p.id} />
                  <PartnerFields
                    idPrefix={`partner-${p.id}`}
                    defaults={{
                      name: p.name,
                      slug: p.slug,
                      category: p.category,
                      websiteUrl: p.websiteUrl ?? "",
                      summary: p.summary ?? "",
                      sortOrder: p.sortOrder,
                      logoMedia: toMediaFieldValue(p.logoMedia),
                    }}
                  />
                  <Button type="submit" density="admin">
                    Save changes
                  </Button>
                </form>
              </details>
            </li>
          ))
        )}
      </ul>

      {/* ----------------------------- Leadership ----------------------------- */}
      <section className={`${sectionClass} mt-12`}>
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add leadership profile</h2>
        <form action={createLeadershipProfileAction} className="mt-4 space-y-3">
          <LeadershipFields idPrefix="leader-new" />
          <PublishNowCheckbox />
          <Button type="submit" density="admin">
            Save profile
          </Button>
        </form>
      </section>

      <h2 className="mt-8 text-sm font-semibold text-[var(--foreground)]">
        Leadership ({leadership.length})
      </h2>
      <ul className="mt-4 space-y-3">
        {leadership.length === 0 ? (
          <li>
            <AdminEmptyState message="No leadership profiles yet." />
          </li>
        ) : (
          leadership.map((l) => (
            <li key={l.id} className={rowClass}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--foreground)]">{l.name}</p>
                  <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                    {l.roleTitle}
                    {l.portraitMedia ? " · portrait set" : " · no portrait"}
                    {l.publishedAt ? (
                      <span className="text-emerald-700"> · published</span>
                    ) : (
                      <span> · draft</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PublishToggle
                    publishedAt={l.publishedAt}
                    id={l.id}
                    publishAction={publishLeadershipProfileAction}
                    unpublishAction={unpublishLeadershipProfileAction}
                  />
                  <DeleteRowForm
                    action={deleteLeadershipProfileAction}
                    id={l.id}
                    confirmMessage="Delete this leadership profile permanently?"
                  />
                </div>
              </div>
              <details className={editDetailsClass}>
                <summary className="cursor-pointer text-xs font-semibold text-[var(--primary)]">
                  Edit
                </summary>
                <form action={updateLeadershipProfileAction} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={l.id} />
                  <LeadershipFields
                    idPrefix={`leader-${l.id}`}
                    defaults={{
                      name: l.name,
                      roleTitle: l.roleTitle,
                      bio: l.bio ?? "",
                      sortOrder: l.sortOrder,
                      portraitMedia: toMediaFieldValue(l.portraitMedia),
                    }}
                  />
                  <Button type="submit" density="admin">
                    Save changes
                  </Button>
                </form>
              </details>
            </li>
          ))
        )}
      </ul>

      {/* ---------------------------- Endorsements ---------------------------- */}
      <section className={`${sectionClass} mt-12`}>
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add endorsement</h2>
        <form action={createEndorsementAction} className="mt-4 space-y-3">
          <EndorsementFields idPrefix="endorsement-new" />
          <PublishNowCheckbox />
          <Button type="submit" density="admin">
            Save endorsement
          </Button>
        </form>
      </section>

      <h2 className="mt-8 text-sm font-semibold text-[var(--foreground)]">
        Endorsements ({endorsements.length})
      </h2>
      <ul className="mt-4 space-y-3">
        {endorsements.length === 0 ? (
          <li>
            <AdminEmptyState message="No endorsements yet." />
          </li>
        ) : (
          endorsements.map((e) => (
            <li key={e.id} className={rowClass}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--foreground)]">“{e.quote}”</p>
                  <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                    {e.attributionName}
                    {e.attributionRole ? ` · ${e.attributionRole}` : null}
                    {e.publishedAt ? (
                      <span className="text-emerald-700"> · published</span>
                    ) : (
                      <span> · draft</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PublishToggle
                    publishedAt={e.publishedAt}
                    id={e.id}
                    publishAction={publishEndorsementAction}
                    unpublishAction={unpublishEndorsementAction}
                  />
                  <DeleteRowForm
                    action={deleteEndorsementAction}
                    id={e.id}
                    confirmMessage="Delete this endorsement permanently?"
                  />
                </div>
              </div>
              <details className={editDetailsClass}>
                <summary className="cursor-pointer text-xs font-semibold text-[var(--primary)]">
                  Edit
                </summary>
                <form action={updateEndorsementAction} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={e.id} />
                  <EndorsementFields
                    idPrefix={`endorsement-${e.id}`}
                    defaults={{
                      quote: e.quote,
                      attributionName: e.attributionName,
                      attributionRole: e.attributionRole ?? "",
                      sortOrder: e.sortOrder,
                    }}
                  />
                  <Button type="submit" density="admin">
                    Save changes
                  </Button>
                </form>
              </details>
            </li>
          ))
        )}
      </ul>
    </AdminPageContainer>
  );
}
