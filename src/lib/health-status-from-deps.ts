/** Postgres / Redis probe outcomes used by `/api/health`. */

export type DependencyProbe = "not_configured" | "ok" | "error";

export type AggregateHealthStatus = "ok" | "degraded" | "unhealthy";

/**
 * Overall health from dependency probes (matches production rules: Postgres failure
 * is unhealthy; Redis-only failure is degraded).
 */
export function healthStatusFromDependencies(
  postgres: DependencyProbe,
  redis: DependencyProbe,
): AggregateHealthStatus {
  if (postgres === "error") return "unhealthy";
  if (redis === "error") return "degraded";
  return "ok";
}

export function healthHttpStatus(status: AggregateHealthStatus): number {
  return status === "unhealthy" ? 503 : 200;
}
