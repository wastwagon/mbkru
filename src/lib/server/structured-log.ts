import "server-only";

/**
 * Opt-in JSON lines to stderr for log aggregators (no third-party SDK).
 * Set `MBKRU_STRUCTURED_ERRORS=1` in production when your platform ingests stdout/stderr.
 */
export function logServerError(
  where: string,
  error: unknown,
  extra?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (process.env.MBKRU_STRUCTURED_ERRORS !== "1") return;
  const err = error instanceof Error ? error : new Error(String(error));
  const line = {
    ts: new Date().toISOString(),
    level: "error",
    where,
    message: err.message,
    name: err.name,
    stack: err.stack,
    ...extra,
  };
  console.error(JSON.stringify(line));
}
