import type { PublicNavLink } from "@/config/public-platform-nav";

function pathMatchesPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/**
 * Header / mobile nav: active state for `PublicNavLink`, including optional search-param matches.
 */
export function publicNavLeafIsActive(
  pathname: string,
  searchParams: URLSearchParams,
  leaf: Pick<
    PublicNavLink,
    "href" | "activeWhenPathStartsWith" | "activeExcludePathStartsWith" | "activeQuery"
  >,
): boolean {
  const prefixes =
    leaf.activeWhenPathStartsWith == null
      ? []
      : Array.isArray(leaf.activeWhenPathStartsWith)
        ? leaf.activeWhenPathStartsWith
        : [leaf.activeWhenPathStartsWith];

  if (prefixes.length > 0) {
    const pathOk = prefixes.some((p) => pathMatchesPrefix(pathname, p));
    if (!pathOk) return false;
    if (
      leaf.activeExcludePathStartsWith &&
      pathname.startsWith(leaf.activeExcludePathStartsWith)
    ) {
      return false;
    }
    if (leaf.activeQuery) {
      for (const [k, v] of Object.entries(leaf.activeQuery)) {
        if (searchParams.get(k) !== v) return false;
      }
    }
    return true;
  }

  const hrefPath = leaf.href.split("?")[0];

  if (pathname === hrefPath) {
    if (leaf.activeQuery) {
      for (const [k, v] of Object.entries(leaf.activeQuery)) {
        if (searchParams.get(k) !== v) return false;
      }
    }
    return true;
  }

  if (pathname.startsWith(`${hrefPath}/`)) {
    if (leaf.activeExcludePathStartsWith && pathname.startsWith(leaf.activeExcludePathStartsWith)) {
      return false;
    }
    if (leaf.activeQuery) {
      for (const [k, v] of Object.entries(leaf.activeQuery)) {
        if (searchParams.get(k) !== v) return false;
      }
    }
    return true;
  }

  return false;
}
