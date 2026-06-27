import Link from "next/link";

import {
  signCouncilMpEvaluationAction,
  upsertCouncilMpEvaluationDraftAction,
} from "@/app/(main)/communities/[slug]/portal/actions";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

type MpOption = { id: string; label: string };

type EvaluationRow = {
  id: string;
  status: string;
  meetingDate: Date;
  meetingSummary: string;
  signedAt: Date | null;
  createdAt: Date;
  parliamentMember: { name: string };
  citizenReport: { trackingCode: string } | null;
};

type Props = {
  communitySlug: string;
  isQueenMother: boolean;
  mpOptions: MpOption[];
  defaultParliamentMemberId?: string | null;
  evaluations: EvaluationRow[];
};

const inputClass = `mt-1 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

export function CouncilMpEvaluationSection({
  communitySlug,
  isQueenMother,
  mpOptions,
  defaultParliamentMemberId,
  evaluations,
}: Props) {
  const drafts = evaluations.filter((e) => e.status === "DRAFT");
  const submitted = evaluations.filter((e) => e.status === "SUBMITTED");

  return (
    <section id="mp-evaluation" className="mt-14 scroll-mt-24">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">MP development &amp; performance evaluation</h2>
      <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
        Record a council meeting with your MP, score constituency accountability, and submit to MBKRU staff for triage.
        This is an <strong className="text-[var(--foreground)]">institutional council assessment</strong> — not a
        published People&apos;s Report Card score until editorial staff review it.
      </p>

      <div className="mt-4 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-4 py-3 text-xs leading-relaxed text-[var(--foreground-secondary)]">
        <p>
          <strong className="text-[var(--foreground)]">Workflow:</strong> moderators or Queen Mothers draft → verified
          Queen Mother signs → staff queue as corroborated MP performance signal.
        </p>
        {!isQueenMother ? (
          <p className="mt-2">
            You can save drafts. A <strong className="text-[var(--foreground)]">verified Queen Mother</strong> must sign
            to send to staff.
          </p>
        ) : null}
      </div>

      <form action={upsertCouncilMpEvaluationDraftAction} className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <input type="hidden" name="communitySlug" value={communitySlug} />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">New meeting record</h3>

        <div>
          <label htmlFor="council-mp" className="block text-xs font-medium text-[var(--foreground)]">
            Member of Parliament <span className="text-red-600">*</span>
          </label>
          <select
            id="council-mp"
            name="parliamentMemberId"
            required
            className={`${inputClass} cursor-pointer`}
            defaultValue={
              defaultParliamentMemberId &&
              mpOptions.some((m) => m.id === defaultParliamentMemberId)
                ? defaultParliamentMemberId
                : ""
            }
          >
            <option value="" disabled>
              Select MP…
            </option>
            {mpOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          {mpOptions.length === 0 ? (
            <p className="mt-1 text-xs text-amber-800">No MPs loaded for this community&apos;s region.</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="council-meeting-date" className="block text-xs font-medium text-[var(--foreground)]">
            Meeting date <span className="text-red-600">*</span>
          </label>
          <input id="council-meeting-date" name="meetingDate" type="date" required className={inputClass} />
        </div>

        <div>
          <label htmlFor="council-summary" className="block text-xs font-medium text-[var(--foreground)]">
            Meeting summary <span className="text-red-600">*</span>
          </label>
          <textarea
            id="council-summary"
            name="meetingSummary"
            required
            minLength={20}
            rows={5}
            placeholder="What was discussed? Include observable facts, dates, and project names where known."
            className={`${inputClass} resize-y min-h-[120px]`}
          />
        </div>

        <div>
          <label htmlFor="council-projects" className="block text-xs font-medium text-[var(--foreground)]">
            Development projects discussed
          </label>
          <textarea
            id="council-projects"
            name="projectsDiscussed"
            rows={3}
            className={`${inputClass} resize-y`}
            placeholder="Roads, clinics, schools, funds — status and commitments if stated."
          />
        </div>

        <div>
          <label htmlFor="council-attendees" className="block text-xs font-medium text-[var(--foreground)]">
            Council attendees
          </label>
          <textarea
            id="council-attendees"
            name="attendeesNotes"
            rows={2}
            className={`${inputClass} resize-y`}
            placeholder="Queen Mother, moderators, council members present."
          />
        </div>

        <fieldset className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/40 px-4 py-3">
          <legend className="px-1 text-xs font-semibold text-[var(--foreground)]">
            Performance rubric (optional, 1–5)
          </legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {(
              [
                ["accessibility", "Accessibility"],
                ["responsiveness", "Responsiveness"],
                ["followThrough", "Follow-through"],
              ] as const
            ).map(([name, label]) => (
              <div key={name}>
                <label htmlFor={`council-rubric-${name}`} className="block text-[11px] font-medium text-[var(--foreground-secondary)]">
                  {label}
                </label>
                <input
                  id={`council-rubric-${name}`}
                  name={name}
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={mpOptions.length === 0}
          className={`min-h-11 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60 ${focusRingSmClass}`}
        >
          Save draft
        </button>
      </form>

      {drafts.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Drafts awaiting Queen Mother sign-off</h3>
          <ul className="mt-4 space-y-4">
            {drafts.map((d) => (
              <li key={d.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">{d.parliamentMember.name}</p>
                <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                  Meeting{" "}
                  {d.meetingDate.toLocaleDateString("en-GB", { dateStyle: "medium" })} · updated{" "}
                  {d.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-[var(--foreground-secondary)]">{d.meetingSummary}</p>
                {isQueenMother ? (
                  <form action={signCouncilMpEvaluationAction} className="mt-4">
                    <input type="hidden" name="communitySlug" value={communitySlug} />
                    <input type="hidden" name="evaluationId" value={d.id} />
                    <button
                      type="submit"
                      className={`rounded-xl bg-[var(--accent-gold)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:opacity-90 ${focusRingSmClass}`}
                    >
                      Sign &amp; submit to staff queue
                    </button>
                  </form>
                ) : (
                  <p className="mt-3 text-xs text-[var(--foreground-secondary)]">Awaiting Queen Mother signature.</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {submitted.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Submitted to staff</h3>
          <ul className="mt-4 space-y-3">
            {submitted.map((d) => (
              <li key={d.id} className="rounded-xl border border-[var(--border)] bg-[var(--section-light)]/30 px-4 py-3 text-sm">
                <span className="font-medium text-[var(--foreground)]">{d.parliamentMember.name}</span>
                <span className="text-[var(--foreground-secondary)]">
                  {" "}
                  · {d.meetingDate.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                </span>
                {d.citizenReport?.trackingCode ? (
                  <span className="mt-1 block text-xs">
                    Staff tracking:{" "}
                    <Link href={`/track-report?code=${encodeURIComponent(d.citizenReport.trackingCode)}`} className={primaryLinkClass}>
                      {d.citizenReport.trackingCode}
                    </Link>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
