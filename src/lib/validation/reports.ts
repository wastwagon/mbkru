import { CitizenReportKind } from "@prisma/client";
import { z } from "zod";

const kindSchema = z.nativeEnum(CitizenReportKind);

const turnstileField = z.object({
  turnstileToken: z.string().max(5000).optional(),
});

export const createReportBodySchema = z
  .object({
    kind: kindSchema,
    title: z.string().trim().min(5).max(300),
    body: z.string().trim().min(20).max(50_000),
    category: z.string().trim().max(120).optional(),
    regionId: z.string().cuid().optional(),
    constituencyId: z.string().cuid().optional(),
    latitude: z.number().gte(-90).lte(90).optional(),
    longitude: z.number().gte(-180).lte(180).optional(),
    submitterEmail: z.string().trim().email().max(320).optional(),
  })
  .merge(turnstileField);

export type CreateReportBody = z.infer<typeof createReportBodySchema>;

/** Tracking lookup: uppercase alphanumeric from allocateTrackingCode. */
export const trackingCodeParamSchema = z
  .string()
  .trim()
  .min(8)
  .max(20)
  .regex(/^[A-Z0-9]+$/);
