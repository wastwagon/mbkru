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

/** Raw JSON body for POST /api/diaspora-feedback (before Turnstile verification). */
const diasporaFeedbackJsonShape = z
  .object({
    /** Omitted by older clients — treated as a recent-visit submission for backwards compatibility. */
    engagementKind: z.enum(["RECENT_VISIT", "ABROAD_SUPPORTER"]).default("RECENT_VISIT"),
    fullName: z.string().trim().min(1).max(200),
    email: emailSchema,
    dateOfVisit: z.string().trim().max(12).optional(),
    durationOfStay: z.string().max(240).optional(),
    eventsAttended: z.string().max(10_000).optional(),
    overallRating: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
    meaningfulAspects: z.string().trim().min(1).max(10_000),
    suggestionsImprovement: z.string().trim().min(1).max(10_000),
    returnOrInvest: z.enum(["YES", "NO", "MAYBE"]),
    signature: z.string().trim().min(1).max(200),
    formSignedDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  })
  .merge(turnstileTokenField);

const diasporaFeedbackRefined = diasporaFeedbackJsonShape.superRefine((data, ctx) => {
  if (data.engagementKind === "RECENT_VISIT") {
    if (!data.dateOfVisit || !/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfVisit)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choose the date of your visit",
        path: ["dateOfVisit"],
      });
    }
    const duration = data.durationOfStay?.trim() ?? "";
    if (duration.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please describe duration of stay",
        path: ["durationOfStay"],
      });
    }
    const events = data.eventsAttended?.trim() ?? "";
    if (events.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please list events or programmes",
        path: ["eventsAttended"],
      });
    }
  }
});

/** Client form validation (no transform — keeps date fields as strings for RHF). */
export const diasporaFeedbackFormSchema = diasporaFeedbackRefined;

export type DiasporaFeedbackFormInput = z.input<typeof diasporaFeedbackFormSchema>;

/** API: validated body → Prisma-ready dates and nullable visit fields. */
export const diasporaFeedbackBodySchema = diasporaFeedbackRefined.transform((data) => {
  const formSignedDate = new Date(`${data.formSignedDate}T12:00:00.000Z`);
  if (data.engagementKind === "ABROAD_SUPPORTER") {
    return {
      engagementKind: "ABROAD_SUPPORTER" as const,
      fullName: data.fullName,
      email: data.email,
      dateOfVisit: null as Date | null,
      durationOfStay: null as string | null,
      eventsAttended: null as string | null,
      overallRating: data.overallRating,
      meaningfulAspects: data.meaningfulAspects.trim(),
      suggestionsImprovement: data.suggestionsImprovement.trim(),
      returnOrInvest: data.returnOrInvest,
      signature: data.signature.trim(),
      formSignedDate,
      turnstileToken: data.turnstileToken,
    };
  }
  return {
    engagementKind: "RECENT_VISIT" as const,
    fullName: data.fullName,
    email: data.email,
    dateOfVisit: new Date(`${data.dateOfVisit}T12:00:00.000Z`),
    durationOfStay: data.durationOfStay!.trim(),
    eventsAttended: data.eventsAttended!.trim(),
    overallRating: data.overallRating,
    meaningfulAspects: data.meaningfulAspects.trim(),
    suggestionsImprovement: data.suggestionsImprovement.trim(),
    returnOrInvest: data.returnOrInvest,
    signature: data.signature.trim(),
    formSignedDate,
    turnstileToken: data.turnstileToken,
  };
});

export type DiasporaFeedbackPersistInput = Omit<
  z.output<typeof diasporaFeedbackBodySchema>,
  "turnstileToken"
>;
