import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlForImage(
  source: SanityImageSource | null | undefined | unknown,
  width = 1200
): string | null {
  if (!source) return null;
  try {
    return builder
      .image(source as SanityImageSource)
      .width(width)
      .height(Math.round(width * 0.65))
      .fit("crop")
      .auto("format")
      .url();
  } catch {
    return null;
  }
}
