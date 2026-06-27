import { z } from "zod";

import { normalizeGhanaCardNumber } from "@/lib/ghana-card";

export const ghanaCardVerifyBodySchema = z.object({
  ghanaCardNumber: z.string().trim().min(5).max(32),
  surname: z.string().trim().min(2).max(120),
  forenames: z.string().trim().min(2).max(160),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  turnstileToken: z.string().optional(),
});

export type GhanaCardVerifyBody = z.infer<typeof ghanaCardVerifyBodySchema>;

export function parseGhanaCardVerifyBody(raw: unknown):
  | { ok: true; value: GhanaCardVerifyBody & { normalizedCard: string } }
  | { ok: false } {
  const parsed = ghanaCardVerifyBodySchema.safeParse(raw);
  if (!parsed.success) return { ok: false };

  const normalizedCard = normalizeGhanaCardNumber(parsed.data.ghanaCardNumber);
  if (!normalizedCard) return { ok: false };

  return { ok: true, value: { ...parsed.data, normalizedCard } };
}
