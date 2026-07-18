import "server-only";

import { prisma } from "@/lib/db/prisma";

/** True when media is a public library image suitable for site pages. */
export async function assertPublicImageMedia(mediaId: string): Promise<boolean> {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    select: { visibility: true, mimeType: true },
  });
  return Boolean(media && media.visibility === "PUBLIC" && media.mimeType.startsWith("image/"));
}
