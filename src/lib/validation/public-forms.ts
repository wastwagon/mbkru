import { z } from "zod";

const emailSchema = z.string().trim().email().max(320);

export const contactBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: emailSchema,
  subject: z.string().trim().min(1).max(300),
  message: z.string().trim().min(1).max(20_000),
  enquiryType: z.string().trim().max(120).optional(),
});

export const emailOnlyBodySchema = z.object({
  email: emailSchema,
});
