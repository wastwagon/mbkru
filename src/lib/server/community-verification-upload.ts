import { randomUUID } from "crypto";
import path from "path";

import { prisma } from "@/lib/db/prisma";
import { writePrivateUploadFile } from "@/lib/server/private-upload-storage";
import { MalwareScanError, scanUploadedFileOrThrow } from "@/lib/server/upload-malware-scan";

export const COMMUNITY_VERIFICATION_DOC_MAX_BYTES = 8 * 1024 * 1024;
export const COMMUNITY_VERIFICATION_DOC_MAX_COUNT = 10;

export const COMMUNITY_VERIFICATION_DOC_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function extForMime(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "application/pdf") return ".pdf";
  return ".jpg";
}

export type VerificationUploadErrorCode =
  | "empty"
  | "too_large"
  | "bad_mime"
  | "too_many"
  | "scanner_infected"
  | "scanner_unavailable";

export class VerificationUploadError extends Error {
  constructor(
    readonly code: VerificationUploadErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "VerificationUploadError";
  }
}

/** Persist uploaded verification documents as `Media` rows (same table as admin library). */
export async function createMediaRecordsFromVerificationFiles(files: File[]): Promise<string[]> {
  if (files.length > COMMUNITY_VERIFICATION_DOC_MAX_COUNT) {
    throw new VerificationUploadError("too_many");
  }

  const ids: string[] = [];

  for (const file of files) {
    if (!(file instanceof File) || file.size === 0) {
      throw new VerificationUploadError("empty");
    }
    if (file.size > COMMUNITY_VERIFICATION_DOC_MAX_BYTES) {
      throw new VerificationUploadError("too_large");
    }
    if (!COMMUNITY_VERIFICATION_DOC_MIME.has(file.type)) {
      throw new VerificationUploadError("bad_mime");
    }

    const ext = path.extname(file.name) || extForMime(file.type);
    const safeExt = ext.match(/^\.\w{2,5}$/) ? ext : extForMime(file.type);
    const filename = `${randomUUID()}${safeExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      await scanUploadedFileOrThrow(buffer, "community-verification");
    } catch (err) {
      if (err instanceof MalwareScanError) {
        throw new VerificationUploadError(
          err.code === "infected" ? "scanner_infected" : "scanner_unavailable",
        );
      }
      throw err;
    }
    const storagePath = await writePrivateUploadFile({
      bucket: "community-verifications",
      segments: [filename],
      bytes: buffer,
    });
    const record = await prisma.media.create({
      data: {
        filename: file.name.slice(0, 200),
        storagePath,
        mimeType: file.type,
        alt: null,
      },
    });
    ids.push(record.id);
  }

  return ids;
}
