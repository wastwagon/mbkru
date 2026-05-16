import { z } from "zod";

/**
 * Optional self-rubric for MP performance intakes (1–5). Maps to methodology “structured citizen experience” inputs.
 * Staff `experienceVerificationTier` is separate (editorial ladder).
 */
export const mpPerformanceRubricSchema = z
  .object({
    accessibility: z.number().int().min(1).max(5).optional(),
    responsiveness: z.number().int().min(1).max(5).optional(),
    followThrough: z.number().int().min(1).max(5).optional(),
  })
  .strict();

export type MpPerformanceRubric = z.infer<typeof mpPerformanceRubricSchema>;

export function parseMpPerformanceRubric(
  raw: unknown,
): { ok: true; value: MpPerformanceRubric | null } | { ok: false } {
  if (raw == null || raw === "") return { ok: true, value: null };
  const parsed = mpPerformanceRubricSchema.safeParse(raw);
  if (!parsed.success) return { ok: false };
  const v = parsed.data;
  const hasAny = v.accessibility != null || v.responsiveness != null || v.followThrough != null;
  return { ok: true, value: hasAny ? v : null };
}
