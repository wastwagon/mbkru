-- When an admin marks a report reviewed or dismissed.
ALTER TABLE "CommunityPostReport"
ADD COLUMN "reviewedAt" TIMESTAMP(3);
