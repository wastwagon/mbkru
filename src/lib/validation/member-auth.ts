import { z } from "zod";

const emailSchema = z.string().trim().email().max(320);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(200);

export const memberRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  regionId: z.union([z.string().cuid(), z.literal("")]).optional(),
});

export const memberLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password required"),
});
