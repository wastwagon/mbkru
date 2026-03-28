import "server-only";

/** Virus scanning: not automated in-app; ops should scan uploads volume or use edge AV — see docs/SPRINT_BACKLOG.md */

export const REPORT_ATTACHMENT_MAX_FILES = 3;
export const REPORT_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB each

export const REPORT_ATTACHMENT_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
