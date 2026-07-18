import Link from "next/link";
import { notFound } from "next/navigation";

import { updateRegionHeaderMediaAction } from "@/app/admin/regions/actions";
import { AdminMediaField } from "@/components/admin/AdminMediaField";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { ghanaRegionSlugFromDisplayName } from "@/lib/geo/ghana-region-slug";
import { parseKeySectors } from "@/lib/regions/sector-images";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { ghanaRegionsData } from "@/lib/site-content";

import { RegionGalleryManager } from "./RegionGalleryManager";

export default async function AdminRegionGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;

  const region = await prisma.region.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      headerMedia: { select: { id: true, storagePath: true, filename: true, alt: true } },
    },
  });
  if (!region) notFound();

  const rows = await prisma.regionSectorImage.findMany({
    where: { regionId: region.id },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      sectorLabel: true,
      alt: true,
      credit: true,
      sortOrder: true,
      media: { select: { id: true, storagePath: true, filename: true } },
    },
  });

  const staticRegion = ghanaRegionsData.find(
    (r) => ghanaRegionSlugFromDisplayName(r.name) === region.slug,
  );
  const suggestedSectors = parseKeySectors(staticRegion?.keySectors);

  return (
    <AdminPageContainer width="narrow">
      <AdminPageHeader
        title={`${region.name} — sector gallery`}
        description="Photos shown under “Key sectors” on the public regional page. When this list is empty, bundled openly licensed defaults are shown instead; anything you add here replaces them."
      />

      <p className="mt-2 text-sm">
        <Link href="/admin/regions" className={primaryLinkClass}>
          ← Regions
        </Link>{" "}
        ·{" "}
        <Link href={`/regions/${region.slug}`} className={primaryLinkClass}>
          View public page
        </Link>
      </p>

      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Region header photo</h2>
        <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
          Shown at the top of the public {region.name} page, next to the title. Leave empty for the plain header.
        </p>
        <form action={updateRegionHeaderMediaAction} className="mt-4 space-y-3">
          <input type="hidden" name="regionId" value={region.id} />
          <AdminMediaField name="headerMediaId" label="Header photo" initial={region.headerMedia} />
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Save header photo
          </button>
        </form>
      </section>

      <div className="mt-8">
        <RegionGalleryManager
          regionId={region.id}
          regionName={region.name}
          rows={rows}
          suggestedSectors={suggestedSectors}
        />
      </div>
    </AdminPageContainer>
  );
}
