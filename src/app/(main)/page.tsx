import { formatPostDate, getPublishedPostSummaries, postHeroImage } from "@/lib/content/posts-db";
import { HomePageClient, type HomePageNewsItem } from "@/components/home/HomePageClient";
import { getGovernmentCommitmentsHomePreview } from "@/lib/server/home-government-preview";
import { getPromisesBrowseHomePreview } from "@/lib/server/home-promises-browse-preview";

export const dynamic = "force-dynamic";

function mapPostsForHome(posts: Awaited<ReturnType<typeof getPublishedPostSummaries>>): HomePageNewsItem[] {
  return posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    image: postHeroImage(p),
    dateLabel: formatPostDate(p.publishedAt, p.createdAt),
  }));
}

export default async function Home() {
  const [raw, governmentPreview, promisesBrowsePreview] = await Promise.all([
    getPublishedPostSummaries(),
    getGovernmentCommitmentsHomePreview(),
    getPromisesBrowseHomePreview(),
  ]);
  const cmsPosts = mapPostsForHome(raw).slice(0, 3);
  return (
    <HomePageClient
      cmsPosts={cmsPosts}
      governmentPreview={governmentPreview}
      promisesBrowsePreview={promisesBrowsePreview}
    />
  );
}
