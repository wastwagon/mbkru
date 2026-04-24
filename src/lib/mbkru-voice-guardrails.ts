export type MbkruVoiceSafetyResult =
  | { blocked: false }
  | {
      blocked: true;
      answer: string;
      suggestedLinks: Array<{ label: string; href: string }>;
      reason: "emergency-risk" | "legal-risk" | "self-harm-risk";
    };

const emergencyKeywords = [
  "suicide",
  "kill myself",
  "harm myself",
  "self harm",
  "attack",
  "bomb",
  "violence",
  "abuse",
  "rape",
  "urgent emergency",
];

const legalAdviceKeywords = [
  "legal advice",
  "lawyer",
  "court strategy",
  "how to win case",
  "draft legal defence",
  "criminal defence",
];

export function evaluateMbkruVoiceSafety(message: string): MbkruVoiceSafetyResult {
  const text = message.toLowerCase();
  if (emergencyKeywords.some((keyword) => text.includes(keyword))) {
    return {
      blocked: true,
      reason: text.includes("suicide") || text.includes("harm myself") ? "self-harm-risk" : "emergency-risk",
      answer:
        "I am sorry you are dealing with this. MBKRU Voice cannot provide emergency or crisis instructions. Please contact local emergency services immediately, and reach out to trusted people nearby for urgent support.",
      suggestedLinks: [
        { label: "Contact MBKRU", href: "/contact" },
        { label: "Whistleblowing Guidance", href: "/whistleblowing" },
      ],
    };
  }

  if (legalAdviceKeywords.some((keyword) => text.includes(keyword))) {
    return {
      blocked: true,
      reason: "legal-risk",
      answer:
        "MBKRU Voice can share platform guidance, but cannot provide legal advice or litigation strategy. Please consult a qualified legal professional for case-specific direction.",
      suggestedLinks: [
        { label: "Legal Empowerment", href: "/legal-empowerment" },
        { label: "Contact MBKRU", href: "/contact" },
      ],
    };
  }

  return { blocked: false };
}
