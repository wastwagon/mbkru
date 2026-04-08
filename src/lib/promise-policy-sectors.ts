/** Values stored on `CampaignPromise.policySector` (uppercase). */
export const POLICY_SECTOR_VALUES = [
  "FISCAL",
  "GOVERNANCE",
  "HEALTH",
  "EDUCATION",
  "INFRASTRUCTURE",
  "ENERGY",
  "AGRICULTURE",
  "SOCIAL",
  "OTHER",
] as const;

export type PolicySectorValue = (typeof POLICY_SECTOR_VALUES)[number];

export const POLICY_SECTOR_LABELS: Record<PolicySectorValue, string> = {
  FISCAL: "Fiscal & economy",
  GOVERNANCE: "Governance & institutions",
  HEALTH: "Health",
  EDUCATION: "Education",
  INFRASTRUCTURE: "Infrastructure",
  ENERGY: "Energy & power",
  AGRICULTURE: "Agriculture",
  SOCIAL: "Social protection & jobs",
  OTHER: "Other",
};

export function isPolicySectorValue(raw: string): raw is PolicySectorValue {
  return (POLICY_SECTOR_VALUES as readonly string[]).includes(raw);
}

export function policySectorLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const u = value.trim().toUpperCase();
  if (isPolicySectorValue(u)) return POLICY_SECTOR_LABELS[u];
  return value;
}
