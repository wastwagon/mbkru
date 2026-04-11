-- Email on diaspora feedback for staff follow-up (no member account required).

ALTER TABLE "DiasporaFeedbackSubmission" ADD COLUMN "email" VARCHAR(320);

UPDATE "DiasporaFeedbackSubmission"
SET "email" = 'legacy-no-email@mbkru.invalid'
WHERE "email" IS NULL;

ALTER TABLE "DiasporaFeedbackSubmission" ALTER COLUMN "email" SET NOT NULL;

CREATE INDEX "DiasporaFeedbackSubmission_email_idx" ON "DiasporaFeedbackSubmission"("email");
