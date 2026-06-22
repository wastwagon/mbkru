import { HomePageClient } from "@/components/home/HomePageClient";
import { getServerPlatformPhase } from "@/config/platform";
import { emptyHomeAtAGlanceData } from "@/lib/home-at-a-glance-types";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getPublicNewsCatalog } from "@/lib/public-news-catalog";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";
import { getCachedMpsPublicRoster } from "@/lib/server/accountability-cache";
import { getHomeAtAGlanceData } from "@/lib/server/home-at-a-glance-data";
import { getGovernmentCommitmentsHomePreview } from "@/lib/server/home-government-preview";

export const dynamic = "force-dynamic";

export default async function Home() {
  const phase = getServerPlatformPhase();
  const showMpSearch = phase >= 2 && isPromisesBrowseEnabled() && isDatabaseConfigured();
  const [newsCatalog, accountabilityPreview, atAGlance, mpRoster] = await Promise.all([
    getPublicNewsCatalog(),
    getGovernmentCommitmentsHomePreview(),
    phase >= 2 ? getHomeAtAGlanceData() : Promise.resolve(emptyHomeAtAGlanceData()),
    showMpSearch
      ? getCachedMpsPublicRoster().catch(() => [] as Awaited<ReturnType<typeof getCachedMpsPublicRoster>>)
      : Promise.resolve([] as Awaited<ReturnType<typeof getCachedMpsPublicRoster>>),
  ]);
  return (
    <HomePageClient
      newsCatalog={newsCatalog}
      accountabilityPreview={accountabilityPreview}
      atAGlance={atAGlance}
      mpRoster={mpRoster}
      showMpSearch={showMpSearch && mpRoster.length > 0}
    />
  );
}
