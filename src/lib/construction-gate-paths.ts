/**
 * Paths that bypass the public under-construction gate.
 * Admins with a valid session can still reach all routes (preview mode).
 */

const STATIC_FILE =
  /\.(svg|png|jpe?g|gif|webp|avif|ico|js|css|woff2?|txt|xml|json|map|webmanifest)$/i;

export function isConstructionGateExemptPath(pathname: string): boolean {
  if (pathname === "/under-construction") return true;
  if (pathname === "/contact") return true;
  if (pathname === "/api/contact") return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/api/admin")) return true;
  if (pathname === "/api/site-gate") return true;
  if (pathname === "/api/health") return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return true;
  if (pathname === "/sw.js" || pathname === "/sw-precache.json") return true;
  if (pathname.startsWith("/images/")) return true;
  if (STATIC_FILE.test(pathname)) return true;
  return false;
}

export function isConstructionGatedApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/") && !isConstructionGateExemptPath(pathname);
}
