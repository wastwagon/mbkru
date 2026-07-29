import type { ProgrammeEventKind, TownHallEventStatus } from "@prisma/client";

import { AdminMediaField } from "@/components/admin/AdminMediaField";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { programmeEventKindLabel } from "@/lib/programme-event-labels";

export type TownHallFormDefaults = {
  id?: string;
  slug: string;
  title: string;
  kind: ProgrammeEventKind;
  summary: string;
  programmeQuarter: string;
  venueLine: string;
  infoUrl: string;
  sourceCitation: string;
  sortOrder: number;
  status: TownHallEventStatus;
  regionId: string;
  constituencyId: string;
  startsAt: string;
  endsAt: string;
  featuredMediaId: string;
  featuredMedia: { id: string; storagePath: string; filename: string; alt: string | null } | null;
};

const STATUSES: TownHallEventStatus[] = ["TBC", "SCHEDULED", "COMPLETED", "CANCELLED"];
const KINDS: ProgrammeEventKind[] = ["TOWN_HALL", "REGIONAL_FORUM", "CONSTITUENCY_DEBATE"];

export function TownHallFormFields({
  regions,
  constituencies,
  defaults,
}: {
  regions: { id: string; name: string }[];
  constituencies: { id: string; name: string; regionName: string }[];
  defaults: TownHallFormDefaults;
}) {
  return (
    <>
      {defaults.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      <FormField label="Slug" htmlFor="slug" hint="Lowercase, hyphens">
        <Input
          id="slug"
          name="slug"
          required
          maxLength={140}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          defaultValue={defaults.slug}
          density="admin"
          autoComplete="off"
        />
      </FormField>
      <FormField label="Title" htmlFor="title" className="sm:col-span-2">
        <Input id="title" name="title" required maxLength={300} defaultValue={defaults.title} density="admin" />
      </FormField>
      <FormField label="Programme type" htmlFor="kind">
        <Select id="kind" name="kind" density="admin" defaultValue={defaults.kind} required>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {programmeEventKindLabel(k)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Summary" htmlFor="summary" className="sm:col-span-2">
        <Textarea
          id="summary"
          name="summary"
          rows={4}
          maxLength={20000}
          defaultValue={defaults.summary}
          density="admin"
        />
      </FormField>
      <FormField label="Programme quarter" htmlFor="programmeQuarter" optional>
        <Input
          id="programmeQuarter"
          name="programmeQuarter"
          maxLength={80}
          placeholder="e.g. Q3 2026"
          defaultValue={defaults.programmeQuarter}
          density="admin"
        />
      </FormField>
      <FormField label="Region" htmlFor="regionId" optional>
        <Select id="regionId" name="regionId" density="admin" defaultValue={defaults.regionId}>
          <option value="">— None / national —</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField
        label="Constituency"
        htmlFor="constituencyId"
        className="sm:col-span-2"
        optional
        hint="For debates"
      >
        <Select id="constituencyId" name="constituencyId" density="admin" defaultValue={defaults.constituencyId}>
          <option value="">— None —</option>
          {constituencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.regionName})
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Status" htmlFor="status">
        <Select id="status" name="status" density="admin" defaultValue={defaults.status} required>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Sort order" htmlFor="sortOrder">
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          max={999999}
          defaultValue={defaults.sortOrder}
          density="admin"
        />
      </FormField>
      <FormField label="Venue line" htmlFor="venueLine" className="sm:col-span-2" optional>
        <Input id="venueLine" name="venueLine" maxLength={500} defaultValue={defaults.venueLine} density="admin" />
      </FormField>
      <FormField label="Starts" htmlFor="startsAt" optional hint="Local timezone">
        <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={defaults.startsAt} density="admin" />
      </FormField>
      <FormField label="Ends" htmlFor="endsAt" optional>
        <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={defaults.endsAt} density="admin" />
      </FormField>
      <FormField label="Info URL" htmlFor="infoUrl" className="sm:col-span-2" optional>
        <Input
          id="infoUrl"
          name="infoUrl"
          type="url"
          maxLength={2000}
          placeholder="https://"
          defaultValue={defaults.infoUrl}
          density="admin"
        />
      </FormField>
      <FormField label="Source / citation" htmlFor="sourceCitation" className="sm:col-span-2" optional>
        <Textarea
          id="sourceCitation"
          name="sourceCitation"
          rows={3}
          maxLength={20000}
          defaultValue={defaults.sourceCitation}
          density="admin"
        />
      </FormField>
      <AdminMediaField
        name="featuredMediaId"
        label="Featured photo (optional)"
        help="Documentary image for the public town-hall / debate listing. Public library images only."
        initial={defaults.featuredMedia}
      />
    </>
  );
}

export function formatLocalDateTimeInput(d: Date | null | undefined): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
