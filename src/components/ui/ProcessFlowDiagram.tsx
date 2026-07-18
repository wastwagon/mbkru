type Step = { title: string; detail: string };

/**
 * Compact horizontal process diagram for Voice / methodology / legal routing pages.
 * Pure SVG + text — no photography required.
 */
export function ProcessFlowDiagram({
  title,
  steps,
  className = "",
}: {
  title: string;
  steps: Step[];
  className?: string;
}) {
  return (
    <figure
      className={`rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6 ${className}`}
      aria-label={title}
    >
      <figcaption className="text-sm font-semibold text-[var(--foreground)]">{title}</figcaption>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="relative rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/[0.04] p-4"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
              {i + 1}
            </span>
            <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{step.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-secondary)]">{step.detail}</p>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export const VOICE_REPORT_LIFECYCLE_STEPS: Step[] = [
  {
    title: "Submit",
    detail: "A signed-in member files a Voice report with optional evidence and location.",
  },
  {
    title: "Triage",
    detail: "Programme staff review, classify, and route — not a court or police desk.",
  },
  {
    title: "Update",
    detail: "Status changes are recorded; the submitter can track progress with their code.",
  },
  {
    title: "Publish aggregates",
    detail: "Approved public causes and transparency stats share patterns — not private identities.",
  },
];

export const METHODOLOGY_EVIDENCE_STEPS: Step[] = [
  {
    title: "Source",
    detail: "Manifesto PDF, Hansard, speech, or official release cited with a date.",
  },
  {
    title: "Catalogue row",
    detail: "Editors create a tracked pledge with status and verification notes.",
  },
  {
    title: "Report Card",
    detail: "Published cycles score sitting MPs against agreed methodology.",
  },
  {
    title: "Public check",
    detail: "Citizens can open sources, dispute windows, and Voice intakes separately.",
  },
];

export const LEGAL_ROUTING_STEPS: Step[] = [
  {
    title: "Emergency?",
    detail: "Threat to life or ongoing crime → local emergency services first.",
  },
  {
    title: "Regulator / CHRAJ",
    detail: "Administrative rights, discrimination, or official misconduct → formal channels.",
  },
  {
    title: "Courts",
    detail: "Disputes needing enforceable orders → legal counsel and the courts.",
  },
  {
    title: "MBKRU Voice",
    detail: "Civic documentation and accountability monitoring — not a substitute for the above.",
  },
];

export const SITUATIONAL_ALERT_FLOW_STEPS: Step[] = [
  {
    title: "Submit",
    detail: "File a time-sensitive local alert with location and a short description.",
  },
  {
    title: "Review",
    detail: "Programme staff triage — not a police desk or emergency line.",
  },
  {
    title: "Track",
    detail: "Use your tracking code to follow status updates on the site.",
  },
];

export const DATA_PROVENANCE_STEPS: Step[] = [
  {
    title: "Official source",
    detail: "Parliament, EC, Wikipedia (CC BY-SA), or a cited government/PDF release.",
  },
  {
    title: "Editorial review",
    detail: "MBKRU staff match labels, attach citations, and keep starter data marked honestly.",
  },
  {
    title: "Public dataset",
    detail: "Published on the site with this Data sources page so anyone can verify the trail.",
  },
];
