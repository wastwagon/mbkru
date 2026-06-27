import { z } from "zod";

import { mpPerformanceRubricSchema } from "@/lib/mp-performance-rubric";

const optionalScore = z
  .union([z.string(), z.number(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === "") return undefined;
    const n = typeof v === "number" ? v : Number.parseInt(String(v), 10);
    return Number.isFinite(n) ? n : undefined;
  })
  .pipe(z.number().int().min(1).max(5).optional());

export const councilMpEvaluationDraftSchema = z.object({
  evaluationId: z.string().cuid().optional(),
  parliamentMemberId: z.string().cuid(),
  meetingDate: z.string().trim().min(1),
  meetingSummary: z.string().trim().min(20).max(20_000),
  projectsDiscussed: z.string().trim().max(10_000).optional(),
  attendeesNotes: z.string().trim().max(5_000).optional(),
  accessibility: optionalScore,
  responsiveness: optionalScore,
  followThrough: optionalScore,
});

export type CouncilMpEvaluationDraftInput = z.infer<typeof councilMpEvaluationDraftSchema>;

export function parseCouncilMpEvaluationDraft(formData: FormData):
  | { ok: true; value: CouncilMpEvaluationDraftInput }
  | { ok: false } {
  const evaluationIdRaw = String(formData.get("evaluationId") ?? "").trim();
  const parsed = councilMpEvaluationDraftSchema.safeParse({
    evaluationId: evaluationIdRaw || undefined,
    parliamentMemberId: formData.get("parliamentMemberId"),
    meetingDate: formData.get("meetingDate"),
    meetingSummary: formData.get("meetingSummary"),
    projectsDiscussed: String(formData.get("projectsDiscussed") ?? "").trim() || undefined,
    attendeesNotes: String(formData.get("attendeesNotes") ?? "").trim() || undefined,
    accessibility: formData.get("accessibility") ?? undefined,
    responsiveness: formData.get("responsiveness") ?? undefined,
    followThrough: formData.get("followThrough") ?? undefined,
  });
  if (!parsed.success) return { ok: false };
  return { ok: true, value: parsed.data };
}

export function buildCouncilRubricJson(input: CouncilMpEvaluationDraftInput): Record<string, number> | null {
  const rubricParsed = mpPerformanceRubricSchema.safeParse({
    accessibility: input.accessibility,
    responsiveness: input.responsiveness,
    followThrough: input.followThrough,
  });
  if (!rubricParsed.success) return null;
  const v = rubricParsed.data;
  const hasAny = v.accessibility != null || v.responsiveness != null || v.followThrough != null;
  if (!hasAny) return null;
  const out: Record<string, number> = {};
  if (v.accessibility != null) out.accessibility = v.accessibility;
  if (v.responsiveness != null) out.responsiveness = v.responsiveness;
  if (v.followThrough != null) out.followThrough = v.followThrough;
  return out;
}

export function parseMeetingDate(raw: string): Date | null {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}
