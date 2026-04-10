import type { ProgrammeEventKind, TownHallEventStatus } from "@prisma/client";

import { programmeEventKindLabel } from "@/lib/programme-event-labels";

const input = "mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm";
const label = "block text-xs font-medium text-[var(--foreground)]";

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
      <div>
        <label htmlFor="slug" className={label}>
          Slug <span className="font-normal text-[var(--muted-foreground)]">(lowercase, hyphens)</span>
        </label>
        <input
          id="slug"
          name="slug"
          required
          maxLength={140}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          defaultValue={defaults.slug}
          className={input}
          autoComplete="off"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="title" className={label}>
          Title
        </label>
        <input id="title" name="title" required maxLength={300} defaultValue={defaults.title} className={input} />
      </div>
      <div>
        <label htmlFor="kind" className={label}>
          Programme type
        </label>
        <select id="kind" name="kind" className={input} defaultValue={defaults.kind} required>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {programmeEventKindLabel(k)}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="summary" className={label}>
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={4}
          maxLength={20000}
          defaultValue={defaults.summary}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="programmeQuarter" className={label}>
          Programme quarter <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <input
          id="programmeQuarter"
          name="programmeQuarter"
          maxLength={80}
          placeholder="e.g. Q3 2026"
          defaultValue={defaults.programmeQuarter}
          className={input}
        />
      </div>
      <div>
        <label htmlFor="regionId" className={label}>
          Region <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <select id="regionId" name="regionId" className={input} defaultValue={defaults.regionId}>
          <option value="">— None / national —</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="constituencyId" className={label}>
          Constituency <span className="font-normal text-[var(--muted-foreground)]">(optional — for debates)</span>
        </label>
        <select id="constituencyId" name="constituencyId" className={input} defaultValue={defaults.constituencyId}>
          <option value="">— None —</option>
          {constituencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.regionName})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status" className={label}>
          Status
        </label>
        <select id="status" name="status" className={input} defaultValue={defaults.status} required>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="sortOrder" className={label}>
          Sort order
        </label>
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          max={999999}
          defaultValue={defaults.sortOrder}
          className={input}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="venueLine" className={label}>
          Venue line <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <input id="venueLine" name="venueLine" maxLength={500} defaultValue={defaults.venueLine} className={input} />
      </div>
      <div>
        <label htmlFor="startsAt" className={label}>
          Starts <span className="font-normal text-[var(--muted-foreground)]">(optional, local)</span>
        </label>
        <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={defaults.startsAt} className={input} />
      </div>
      <div>
        <label htmlFor="endsAt" className={label}>
          Ends <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={defaults.endsAt} className={input} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="infoUrl" className={label}>
          Info URL <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <input
          id="infoUrl"
          name="infoUrl"
          type="url"
          maxLength={2000}
          placeholder="https://"
          defaultValue={defaults.infoUrl}
          className={input}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="sourceCitation" className={label}>
          Source / citation <span className="font-normal text-[var(--muted-foreground)]">(optional)</span>
        </label>
        <textarea
          id="sourceCitation"
          name="sourceCitation"
          rows={3}
          maxLength={20000}
          defaultValue={defaults.sourceCitation}
          className={input}
        />
      </div>
    </>
  );
}

export function formatLocalDateTimeInput(d: Date | null | undefined): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
