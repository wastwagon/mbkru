import { HomePageClient } from "@/components/home/HomePageClient";
import { getServerPlatformPhase } from "@/config/platform";
import { emptyHomeAtAGlanceData } from "@/lib/home-at-a-glance-types";
import { getPublicNewsCatalog } from "@/lib/public-news-catalog";
import { getHomeAtAGlanceData } from "@/lib/server/home-at-a-glance-data";
import { getGovernmentCommitmentsHomePreview } from "@/lib/server/home-government-preview";

export const dynamic = "force-dynamic";

export default async function Home() {
  const phase = getServerPlatformPhase();
  const [newsCatalog, accountabilityPreview, atAGlance] = await Promise.all([
    getPublicNewsCatalog(),
    getGovernmentCommitmentsHomePreview(),
    phase >= 2 ? getHomeAtAGlanceData() : Promise.resolve(emptyHomeAtAGlanceData()),
  ]);
  return (
    <HomePageClient
      newsCatalog={newsCatalog}
      accountabilityPreview={accountabilityPreview}
      atAGlance={atAGlance}
    />
  );
}
