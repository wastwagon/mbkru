import "server-only";

import type {
  DiasporaEngagementKind,
  DiasporaFeedbackOverallRating,
  DiasporaFeedbackReturnIntent,
} from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { normalizeLeadEmail } from "@/lib/normalize-email";

export type DiasporaFeedbackSubmissionInput = {
  engagementKind: DiasporaEngagementKind;
  fullName: string;
  email: string;
  dateOfVisit: Date | null;
  durationOfStay: string | null;
  eventsAttended: string | null;
  overallRating: DiasporaFeedbackOverallRating;
  meaningfulAspects: string;
  suggestionsImprovement: string;
  returnOrInvest: DiasporaFeedbackReturnIntent;
  signature: string;
  formSignedDate: Date;
};

export async function createDiasporaFeedbackSubmission(
  input: DiasporaFeedbackSubmissionInput,
): Promise<{ createdAt: Date }> {
  const row = await prisma.diasporaFeedbackSubmission.create({
    data: {
      engagementKind: input.engagementKind,
      fullName: input.fullName.trim(),
      email: normalizeLeadEmail(input.email),
      dateOfVisit: input.dateOfVisit,
      durationOfStay: input.durationOfStay?.trim() ?? null,
      eventsAttended: input.eventsAttended?.trim() ?? null,
      overallRating: input.overallRating,
      meaningfulAspects: input.meaningfulAspects.trim(),
      suggestionsImprovement: input.suggestionsImprovement.trim(),
      returnOrInvest: input.returnOrInvest,
      signature: input.signature.trim(),
      formSignedDate: input.formSignedDate,
    },
    select: { createdAt: true },
  });
  return { createdAt: row.createdAt };
}
