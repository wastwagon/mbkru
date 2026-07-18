/** Controlled petition topics — pictograms + filters; not free-text categories. */
export const PETITION_TOPICS = [
  "GOVERNANCE",
  "INFRASTRUCTURE",
  "HEALTH",
  "EDUCATION",
  "ENVIRONMENT",
  "SECURITY",
  "ECONOMY",
  "OTHER",
] as const;

export type PetitionTopicValue = (typeof PETITION_TOPICS)[number];

export function petitionTopicLabel(topic: PetitionTopicValue | string): string {
  switch (topic) {
    case "GOVERNANCE":
      return "Governance";
    case "INFRASTRUCTURE":
      return "Infrastructure";
    case "HEALTH":
      return "Health";
    case "EDUCATION":
      return "Education";
    case "ENVIRONMENT":
      return "Environment";
    case "SECURITY":
      return "Security";
    case "ECONOMY":
      return "Economy";
    case "OTHER":
      return "Other";
    default:
      return topic;
  }
}

export function isPetitionTopic(value: string): value is PetitionTopicValue {
  return (PETITION_TOPICS as readonly string[]).includes(value);
}
