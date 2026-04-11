-- Diaspora Experience & Feedback form submissions (admin CMS records).

CREATE TYPE "DiasporaFeedbackOverallRating" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

CREATE TYPE "DiasporaFeedbackReturnIntent" AS ENUM ('YES', 'NO', 'MAYBE');

CREATE TABLE "DiasporaFeedbackSubmission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" VARCHAR(200) NOT NULL,
    "dateOfVisit" DATE NOT NULL,
    "durationOfStay" VARCHAR(240) NOT NULL,
    "eventsAttended" TEXT NOT NULL,
    "overallRating" "DiasporaFeedbackOverallRating" NOT NULL,
    "meaningfulAspects" TEXT NOT NULL,
    "suggestionsImprovement" TEXT NOT NULL,
    "returnOrInvest" "DiasporaFeedbackReturnIntent" NOT NULL,
    "signature" VARCHAR(200) NOT NULL,
    "formSignedDate" DATE NOT NULL,

    CONSTRAINT "DiasporaFeedbackSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DiasporaFeedbackSubmission_createdAt_idx" ON "DiasporaFeedbackSubmission"("createdAt");
