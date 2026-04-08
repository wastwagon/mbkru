-- At most one OPEN report per post per reporter (new report allowed after REVIEWED/DISMISSED).
CREATE UNIQUE INDEX "CommunityPostReport_postId_reporter_open_idx" ON "CommunityPostReport" ("postId", "reporterMemberId")
WHERE
  "status" = 'OPEN';
