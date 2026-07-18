-- Verified Queen Mother portraits on community memberships

ALTER TABLE "CommunityMembership" ADD COLUMN "portraitMediaId" TEXT;

ALTER TABLE "CommunityMembership"
  ADD CONSTRAINT "CommunityMembership_portraitMediaId_fkey"
  FOREIGN KEY ("portraitMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
