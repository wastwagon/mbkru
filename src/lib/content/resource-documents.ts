import "server-only";

import { Prisma, type ResourceDocument } from "@prisma/client";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

/** DB URL set but migrations not applied, or schema drift — treat as empty. */
function isRecoverableSchemaError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021";
}

export async function getPublishedResourceDocuments(): Promise<ResourceDocument[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return await prisma.resourceDocument.findMany({
      where: { publishedAt: { not: null } },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
  } catch (e) {
    if (isRecoverableSchemaError(e)) return [];
    throw e;
  }
}

export async function getPublishedResourceDocumentBySlug(
  slug: string,
): Promise<ResourceDocument | null> {
  if (!isDatabaseConfigured()) return null;
  const key = slug.trim();
  if (!key) return null;
  try {
    return await prisma.resourceDocument.findFirst({
      where: {
        publishedAt: { not: null },
        slug: { equals: key, mode: "insensitive" },
      },
    });
  } catch (e) {
    if (isRecoverableSchemaError(e)) return null;
    throw e;
  }
}

export function formatResourceFileSize(bytes: number | null): string {
  if (bytes == null || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function resourceCategoryLabel(category: ResourceDocument["category"]): string {
  switch (category) {
    case "REPORTS":
      return "Reports";
    case "POLICY_BRIEFS":
      return "Policy briefs";
    case "RESEARCH":
      return "Research";
    default:
      return "Other";
  }
}
