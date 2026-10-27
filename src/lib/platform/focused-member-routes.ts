/** Auth and member surfaces that should use slim chrome when launch polish is on. */
const FOCUSED_EXACT = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

export function isFocusedMemberRoute(pathname: string): boolean {
  if (FOCUSED_EXACT.has(pathname)) return true;
  return pathname === "/account" || pathname.startsWith("/account/");
}
