export type MbkruVoiceReply = {
  answer: string;
  suggestedLinks?: Array<{ label: string; href: string }>;
};

type SupportedReplyLanguage = "en-gh" | "twi" | "ga" | "hausa" | "ewe";

type IntentRule = {
  keywords: string[];
  reply: MbkruVoiceReply;
};

const intentRules: IntentRule[] = [
  {
    keywords: ["report", "complaint", "issue", "voice", "submit"],
    reply: {
      answer:
        "You can submit civic issues through Citizens Voice or use Track Report to follow progress. If you need help choosing the right flow, tell me your issue type and district.",
      suggestedLinks: [
        { label: "Citizens Voice", href: "/citizens-voice" },
        { label: "Submit Report", href: "/situational-alerts/submit" },
        { label: "Track Report", href: "/track-report" },
      ],
    },
  },
  {
    keywords: ["petition", "sign", "support", "campaign"],
    reply: {
      answer:
        "You can browse active petitions, sign verified campaigns, or create a new petition with clear evidence and goals.",
      suggestedLinks: [
        { label: "Browse Petitions", href: "/petitions" },
        { label: "Start a Petition", href: "/petitions/new" },
      ],
    },
  },
  {
    keywords: ["promise", "commitment", "tracker", "report card", "mp"],
    reply: {
      answer:
        "MBKRU tracks commitments, report card cycles, and parliamentary accountability data to help citizens verify delivery.",
      suggestedLinks: [
        { label: "Government Commitments", href: "/government-commitments" },
        { label: "Parliament Tracker", href: "/parliament-tracker" },
        { label: "Report Card", href: "/report-card" },
      ],
    },
  },
  {
    keywords: ["community", "join", "forum", "queen mother"],
    reply: {
      answer:
        "Community spaces support local dialogue, moderation, and verified participation. You can explore available communities and join where eligible.",
      suggestedLinks: [
        { label: "Communities", href: "/communities" },
        { label: "Town Halls", href: "/town-halls" },
      ],
    },
  },
  {
    keywords: ["contact", "email", "office", "support", "help"],
    reply: {
      answer:
        "For direct support, use the contact form. For platform policy, check privacy, terms, and data sources.",
      suggestedLinks: [
        { label: "Contact", href: "/contact" },
        { label: "Data Sources", href: "/data-sources" },
        { label: "FAQ", href: "/faq" },
      ],
    },
  },
];

function getLanguagePrefix(languageId: SupportedReplyLanguage): string {
  switch (languageId) {
    case "twi":
      return "Twi guidance: ";
    case "ga":
      return "Ga guidance: ";
    case "hausa":
      return "Hausa guidance: ";
    case "ewe":
      return "Ewe guidance: ";
    default:
      return "";
  }
}

export function getMbkruVoiceFallbackReply(
  message: string,
  languageId: SupportedReplyLanguage = "en-gh",
): MbkruVoiceReply {
  const text = message.toLowerCase();
  const match = intentRules.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));
  if (match) {
    return {
      ...match.reply,
      answer: `${getLanguagePrefix(languageId)}${match.reply.answer}`.trim(),
    };
  }

  return {
    answer: `${getLanguagePrefix(languageId)}I am MBKRU Voice, your always-online customer service assistant. I can help with reports, petitions, promises tracking, communities, and support contacts. Ask me what you want to do and I will guide you.`.trim(),
    suggestedLinks: [
      { label: "Citizens Voice", href: "/citizens-voice" },
      { label: "Petitions", href: "/petitions" },
      { label: "Track Report", href: "/track-report" },
      { label: "Contact Support", href: "/contact" },
    ],
  };
}
