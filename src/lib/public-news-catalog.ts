import "server-only";

import type { PostWithMedia } from "@/lib/content/posts-db";
import { formatPostDate, getPublishedPostSummaries, postHeroImage } from "@/lib/content/posts-db";

export type PublicNewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image: string;
  dateLabel: string;
  href: string;
  publishedAt: Date;
};

function toPublicNewsItem(post: PostWithMedia): PublicNewsItem {
  const publishedAt = post.publishedAt ?? post.createdAt;
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: postHeroImage(post),
    dateLabel: formatPostDate(post.publishedAt, post.createdAt),
    href: `/news/${post.slug}`,
    publishedAt,
  };
}

/** Published Admin → Posts entries, newest first. */
export async function getPublicNewsCatalog(): Promise<PublicNewsItem[]> {
  const cmsPosts = await getPublishedPostSummaries();
  return cmsPosts.map(toPublicNewsItem);
}

export async function getPublicNewsCount(): Promise<number> {
  const catalog = await getPublicNewsCatalog();
  return catalog.length;
}
