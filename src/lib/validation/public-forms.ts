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
