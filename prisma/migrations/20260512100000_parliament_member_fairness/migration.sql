-- Optional editorial metadata for methodology fairness rules (Speaker role, attendance exclusions, notes).
ALTER TABLE "ParliamentMember" ADD COLUMN "fairnessMetadata" JSONB;
