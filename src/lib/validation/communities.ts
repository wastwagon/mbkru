import { z } from "zod";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** URL-safe community slug (lowercase, hyphens). */
export function isCommunitySlug(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  return s.length >= 2 && s.length <= 80 && SLUG_RE.test(s);
}

const postKinds = ["GENERAL", "CONCERN", "ANNOUNCEMENT"] as const;

export const communityPostCreateSchema = z.object({
  kind: z.enum(postKinds),
  body: z.string().trim().min(1).max(20_000),
});

export type CommunityPostCreateInput = z.infer<typeof communityPostCreateSchema>;

export const communityPostReportSchema = z.object({
  reason: z.string().trim().min(3).max(120),
  details: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((s) => (s && s.length ? s : undefined)),
});

export type CommunityPostReportInput = z.infer<typeof communityPostReportSchema>;

export const communityVerificationSubmitSchema = z.object({
  documentMediaIds: z.array(z.string().cuid()).min(1).max(10),
  note: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((s) => (s && s.length ? s : undefined)),
});

export type CommunityVerificationSubmitInput = z.infer<typeof communityVerificationSubmitSchema>;

const MAX_SEARCH_QUERY_LEN = 120;

/** Trimmed search string for FTS, or null if too short / empty. */
export function normalizeCommunitySearchQuery(raw: string): string | null {
  const s = raw.trim().replace(/\s+/g, " ");
  if (s.length < 2) return null;
  return s.length > MAX_SEARCH_QUERY_LEN ? s.slice(0, MAX_SEARCH_QUERY_LEN) : s;
}
