"use client";

import { Dialog } from "@/components/ui/Dialog";

export type RoadmapPhase = {
  period: string;
  phase?: string;
  status?: "complete" | "upcoming";
  title: string;
  description: string;
  items?: readonly string[];
  detailContent?: string;
};

type RoadmapModalProps = {
  phase: RoadmapPhase | null;
  onClose: () => void;
};

export function RoadmapModal({ phase, onClose }: RoadmapModalProps) {
  return (
    <Dialog
      open={Boolean(phase)}
      onClose={onClose}
      titleId="roadmap-modal-title"
      size="lg"
      title={
        phase ? (
          <>
            <span className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-lg bg-[var(--accent-gold)]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent-gold)]">
                {phase.period}
              </span>
              {phase.phase ? (
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    phase.status === "complete"
                      ? "bg-green-100 text-green-800"
                      : "bg-[var(--primary)]/10 text-[var(--primary)]"
                  }`}
                >
                  {phase.phase} {phase.status === "complete" ? "— Complete" : ""}
                </span>
              ) : null}
            </span>
            <span className="block">{phase.title}</span>
          </>
        ) : undefined
      }
    >
      {phase ? (
        <>
          <p className="mt-1 text-sm leading-relaxed text-[var(--foreground-secondary)]">{phase.description}</p>

          {phase.detailContent ? (
            <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--section-light)] p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-secondary)]">
                Full Details
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">{phase.detailContent}</p>
            </div>
          ) : null}

          {phase.items && phase.items.length > 0 ? (
            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-secondary)]">
                {phase.status === "complete" ? "Completed" : "Planned"} Deliverables
              </h4>
              <ul className="mt-3 space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        phase.status === "complete" ? "bg-green-500" : "bg-[var(--primary)]"
                      }`}
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </Dialog>
  );
}
