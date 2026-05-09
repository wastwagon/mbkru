import "server-only";

import type { Prisma } from "@prisma/client";

/** Reports eligible for /citizens-voice/discussions/[id] (Phase A). */
export function voiceDiscussionWhere(reportId: string): Prisma.CitizenReportWhereInput {
  return {
    id: reportId,
    status: { not: "ARCHIVED" },
    discussionEnabled: true,
  };
}
