import { z } from "zod";

const emailSchema = z.string().trim().email().max(320);

const turnstileTokenField = z.object({
  turnstileToken: z.string().max(5000).optional(),
});

export const contactBodySchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    email: emailSchema,
    subject: z.string().trim().min(1).max(300),
    message: z.string().trim().min(1).max(20_000),
    enquiryType: z.string().trim().max(120).optional(),
  })
  .merge(turnstileTokenField);

export const emailOnlyBodySchema = z.object({
  email: emailSchema,
});

export const emailWithTurnstileBodySchema = emailOnlyBodySchema.merge(turnstileTokenField);

function isoDateOnlyField() {
  return z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
    .transform((s) => new Date(`${s}T12:00:00.000Z`));
}

export const diasporaFeedbackBodySchema = z
  .object({
    fullName: z.string().trim().min(1).max(200),
    dateOfVisit: isoDateOnlyField(),
    durationOfStay: z.string().trim().min(1).max(240),
    eventsAttended: z.string().trim().min(1).max(10_000),
    overallRating: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
    meaningfulAspects: z.string().trim().min(1).max(10_000),
    suggestionsImprovement: z.string().trim().min(1).max(10_000),
    returnOrInvest: z.enum(["YES", "NO", "MAYBE"]),
    signature: z.string().trim().min(1).max(200),
    formSignedDate: isoDateOnlyField(),
  })
  .merge(turnstileTokenField);
