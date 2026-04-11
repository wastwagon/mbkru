import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Edge middleware — lightweight response shaping. Security headers live in `next.config.ts`.
 * Private surfaces get `X-Robots-Tag` so crawlers drop them even if linked, alongside `robots.ts`.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  if (pathname === "/account" || pathname.startsWith("/account/")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account", "/account/:path*"],
};
