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
    regionId: z.string().cuid(),
    constituencyId: z.string().cuid().optional(),
    /** Required when kind is MP_PERFORMANCE — roster MP id. */
    parliamentMemberId: z.string().cuid().optional(),
    localArea: z.string().trim().min(3).max(512),
    latitude: z.number().gte(-90).lte(90),
    longitude: z.number().gte(-180).lte(180),
    submitterEmail: z.string().trim().email().max(320).optional(),
    /** International format (E.164), e.g. +233201234567 */
    submitterPhone: z
      .string()
      .trim()
      .max(18)
      .optional()
      .transform((s) => (s && s.length > 0 ? s : undefined)),
  })
  .merge(turnstileField)
  .superRefine((data, ctx) => {
    if (data.submitterPhone && !/^\+[1-9]\d{1,14}$/.test(data.submitterPhone)) {
      ctx.addIssue({
        code: "custom",
        message: "Use international phone format (E.164), e.g. +233201234567",
        path: ["submitterPhone"],
      });
    }
    if (data.kind === "MP_PERFORMANCE") {
      if (!data.parliamentMemberId?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Select the Member of Parliament this report is about.",
          path: ["parliamentMemberId"],
        });
      }
    }
  });

export type CreateReportBody = z.infer<typeof createReportBodySchema>;

/** Tracking lookup: uppercase alphanumeric from allocateTrackingCode. */
export const trackingCodeParamSchema = z
  .string()
  .trim()
  .min(8)
  .max(20)
  .regex(/^[A-Z0-9]+$/);
