import { z } from "zod";

export const operationsPlaybookKeyField = z
  .string()
  .max(160)
  .transform((s) => {
    const t = s.trim();
    return t.length > 0 ? t : undefined;
  });

export const staffNotesField = z
  .string()
  .max(20_000)
  .transform((s) => {
    const t = s.trim();
    return t.length > 0 ? t : undefined;
  });

/** Shown to submitters (account + track-by-code). */
export const adminReplyToSubmitterField = z
  .string()
  .max(12_000)
  .transform((s) => s.trim())
  .refine((s) => s.length > 0, { message: "Enter a message" });
