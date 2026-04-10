import "server-only";

import type { Media, Post } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { images } from "@/lib/site-content";

export type PostWithMedia = Post & { featuredMedia: Media | null };

export async function getPublishedPostSummaries(): Promise<PostWithMedia[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return await prisma.post.findMany({
      where: { publishedAt: { not: null } },
      orderBy: [{ publishedAt: "desc" }],
      include: { featuredMedia: true },
    });
  } catch {
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<PostWithMedia | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    return await prisma.post.findFirst({
      where: { slug, publishedAt: { not: null } },
      include: { featuredMedia: true },
    });
  } catch {
    return null;
  }
}

export function postHeroImage(post: PostWithMedia): string {
  if (post.featuredMedia?.storagePath) return post.featuredMedia.storagePath;
  return images.news;
}

export function formatPostDate(publishedAt: Date | null, createdAt: Date): string {
  const d = publishedAt ?? createdAt;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
