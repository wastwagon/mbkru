import { z } from "zod";

const causeSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const publicCauseSlugField = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters")
  .max(120)
  .regex(causeSlugRegex, "Use lowercase letters, numbers, and hyphens only");

export const publicCauseTitleField = z.string().trim().min(4).max(240);
export const publicCauseSummaryField = z.string().trim().min(20).max(12_000);

export const petitionCreateBodySchema = z.object({
  title: z.string().trim().min(8, "Title is too short").max(280),
  summary: z.string().trim().max(500).optional().nullable(),
  body: z.string().trim().min(40, "Please add more detail").max(50_000),
  targetSignatures: z.number().int().min(10).max(10_000_000).optional().nullable(),
  regionId: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform((s) => (!s ? null : s)),
});

export const petitionSignBodySchema = z.object({
  signerName: z.string().trim().max(120).optional().nullable(),
  signerEmail: z.string().trim().email().max(254),
  consentShowName: z.boolean(),
  consentUpdates: z.boolean(),
  turnstileToken: z.string().optional().nullable(),
});

export const publicCauseCommentBodySchema = z.object({
  body: z.string().trim().min(2).max(2000),
});

export const publicCauseSupportBodySchema = z.object({
  action: z.enum(["add", "remove"]).optional().default("add"),
});
