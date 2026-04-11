import { formatPostDate, getPublishedPostSummaries, postHeroImage } from "@/lib/content/posts-db";
import { HomePageClient, type HomePageNewsItem } from "@/components/home/HomePageClient";
import { getServerPlatformPhase } from "@/config/platform";
import { emptyHomeAtAGlanceData } from "@/lib/home-at-a-glance-types";
import { getHomeAtAGlanceData } from "@/lib/server/home-at-a-glance-data";
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
  const phase = getServerPlatformPhase();
  const [raw, governmentPreview, promisesBrowsePreview, atAGlance] = await Promise.all([
    getPublishedPostSummaries(),
    getGovernmentCommitmentsHomePreview(),
    getPromisesBrowseHomePreview(),
    phase >= 2 ? getHomeAtAGlanceData() : Promise.resolve(emptyHomeAtAGlanceData()),
  ]);
  const cmsPosts = mapPostsForHome(raw).slice(0, 3);
  return (
    <HomePageClient
      cmsPosts={cmsPosts}
      governmentPreview={governmentPreview}
      promisesBrowsePreview={promisesBrowsePreview}
      atAGlance={atAGlance}
    />
  );
}
