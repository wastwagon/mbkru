import { brandIconImageResponse } from "@/lib/brand/render-brand-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return brandIconImageResponse(size.width, size.height);
}
