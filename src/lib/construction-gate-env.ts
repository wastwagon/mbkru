/** True when deploy env forces the public under-construction gate (overrides DB). */
export function isPublicUnderConstructionEnvOverride(): boolean {
  const raw = process.env.PUBLIC_UNDER_CONSTRUCTION?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}
