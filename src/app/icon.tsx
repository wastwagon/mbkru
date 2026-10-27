import { brandIconImageResponse } from "@/lib/brand/render-brand-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return brandIconImageResponse(size.width, size.height);
}
