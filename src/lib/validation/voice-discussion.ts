import { z } from "zod";

export const voiceDiscussionCommentBodySchema = z.object({
  body: z.string().trim().min(2).max(2000),
  parentCommentId: z.string().cuid().nullable().optional(),
});

export const voiceDiscussionReactionBodySchema = z.object({
  kind: z.enum(["LIKE", "THANK", "INSIGHT"]).nullable(),
});

export const voiceDiscussionSupportBodySchema = z.object({
  action: z.enum(["add", "remove"]).optional().default("add"),
});
