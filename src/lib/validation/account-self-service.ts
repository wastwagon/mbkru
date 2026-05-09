import { z } from "zod";

const emailSchema = z.string().trim().email().max(320);

/** Member must re-type their email to confirm irreversible deletion. */
export const accountDeleteBodySchema = z.object({
  confirmEmail: emailSchema,
});
