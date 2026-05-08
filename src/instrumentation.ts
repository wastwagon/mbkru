/**
 * Next.js instrumentation hook — runs once when the Node server starts.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

function parsePlatformPhase(): number {
  const raw = process.env.PLATFORM_PHASE ?? process.env.NEXT_PUBLIC_PLATFORM_PHASE ?? "1";
  const n = Number.parseInt(raw, 10);
  if (n === 2 || n === 3) return n;
  return 1;
}

function looksWeakSessionSecret(value: string): boolean {
  if (value.length < 32) return true;
  const lower = value.toLowerCase();
  return (
    lower.includes("change-me") ||
    lower.includes("replace-with") ||
    lower.includes("example.com") ||
    lower === "secret" ||
    /^0+$/.test(value)
  );
}

export async function register() {
  if (process.env.NODE_ENV !== "production") return;

  const admin = process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
  if (admin && looksWeakSessionSecret(admin)) {
    console.warn(
      "[mbkru] ADMIN_SESSION_SECRET is missing, short, or looks like a dev placeholder — use a strong random value (32+ chars) in production.",
    );
  }

  const phase = parsePlatformPhase();
  if (phase >= 2) {
    const member = process.env.MEMBER_SESSION_SECRET?.trim() ?? "";
    if (member && looksWeakSessionSecret(member)) {
      console.warn(
        "[mbkru] MEMBER_SESSION_SECRET is missing, short, or looks like a dev placeholder — required and must be strong when NEXT_PUBLIC_PLATFORM_PHASE >= 2.",
      );
    }
  }
}
