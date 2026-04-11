import "server-only";

import type { ResourceDocument } from "@prisma/client";

import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export async function getPublishedResourceDocuments(): Promise<ResourceDocument[]> {
  if (!isDatabaseConfigured()) return [];
  return prisma.resourceDocument.findMany({
    where: { publishedAt: { not: null } },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
  });
}

export async function getPublishedResourceDocumentBySlug(
  slug: string,
): Promise<ResourceDocument | null> {
  if (!isDatabaseConfigured()) return null;
  const key = slug.trim();
  if (!key) return null;
  return prisma.resourceDocument.findFirst({
    where: {
      publishedAt: { not: null },
      slug: { equals: key, mode: "insensitive" },
    },
  });
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
