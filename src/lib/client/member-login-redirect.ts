/**
 * Navigate to member login and return to the intended URL after sign-in (`next` must be a same-origin path).
 * Preserves the current query string from `window.location.search` when `pathname` is the active route.
 */
export function redirectToMemberLogin(router: { replace: (href: string) => void }, pathname: string): void {
  const q = typeof window !== "undefined" ? window.location.search : "";
  const nextPath = `${pathname}${q}`;
  router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
}
