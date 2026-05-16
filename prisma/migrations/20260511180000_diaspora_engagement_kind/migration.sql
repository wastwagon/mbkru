-- Diaspora feedback: visit-based vs abroad-only engagement; nullable visit fields for abroad path.
CREATE TYPE "DiasporaEngagementKind" AS ENUM ('RECENT_VISIT', 'ABROAD_SUPPORTER');

ALTER TABLE "DiasporaFeedbackSubmission" ADD COLUMN "engagementKind" "DiasporaEngagementKind" NOT NULL DEFAULT 'RECENT_VISIT';

ALTER TABLE "DiasporaFeedbackSubmission" ALTER COLUMN "dateOfVisit" DROP NOT NULL;
ALTER TABLE "DiasporaFeedbackSubmission" ALTER COLUMN "durationOfStay" DROP NOT NULL;
ALTER TABLE "DiasporaFeedbackSubmission" ALTER COLUMN "eventsAttended" DROP NOT NULL;
