import "server-only";

import type { DiasporaFeedbackOverallRating, DiasporaFeedbackReturnIntent } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export type DiasporaFeedbackSubmissionInput = {
  fullName: string;
  dateOfVisit: Date;
  durationOfStay: string;
  eventsAttended: string;
  overallRating: DiasporaFeedbackOverallRating;
  meaningfulAspects: string;
  suggestionsImprovement: string;
  returnOrInvest: DiasporaFeedbackReturnIntent;
  signature: string;
  formSignedDate: Date;
};

export async function createDiasporaFeedbackSubmission(
  input: DiasporaFeedbackSubmissionInput,
): Promise<void> {
  await prisma.diasporaFeedbackSubmission.create({
    data: {
      fullName: input.fullName.trim(),
      dateOfVisit: input.dateOfVisit,
      durationOfStay: input.durationOfStay.trim(),
      eventsAttended: input.eventsAttended.trim(),
      overallRating: input.overallRating,
      meaningfulAspects: input.meaningfulAspects.trim(),
      suggestionsImprovement: input.suggestionsImprovement.trim(),
      returnOrInvest: input.returnOrInvest,
      signature: input.signature.trim(),
      formSignedDate: input.formSignedDate,
    },
  });
}
