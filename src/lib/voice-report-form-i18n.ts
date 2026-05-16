/**
 * Citizen Voice report form copy keyed by MBKRU Voice UI language (`voicePreferencesStorageKey`).
 * Long legal/programme paragraphs stay English unless an overlay supplies a translation.
 */
import type { VoicePreferences } from "@/lib/voice-languages";

export type VoiceReportFormLangId = VoicePreferences["languageId"];

export type VoiceReportFormPlaceholders = {
  voice: string;
  mpPerf: string;
  govPerf: string;
  election: string;
  situational: string;
};

export type VoiceReportFormStrings = {
  checkingSignIn: string;
  redirectingSignIn: string;
  onlineBanner: string;
  dismiss: string;
  draftsOtherTypesBefore: string;
  draftsOtherTypesLink: string;
  draftsOtherTypesAfter: string;
  pendingDraftsAria: string;
  pendingDraftsTitle: string;
  pendingDraftsHint: string;
  restore: string;
  discard: string;
  successReportReceived: string;
  successSituationalReceived: string;
  saveTrackingCode: string;
  recordedPrefix: string;
  recordedSuffix: string;
  checkStatus: string;
  openMpCommitmentSheet: string;
  howWeUseTitle: string;
  howWeUseLi1: string;
  howWeUseLi2: string;
  howWeUseLi3: string;
  reportTypeLockedPrefix: string;
  reportTypeLabel: string;
  kindVoice: string;
  kindMp: string;
  kindGov: string;
  kindSituational: string;
  kindElection: string;
  electionNoteTitle: string;
  electionNoteBody: string;
  mpNoteTitle: string;
  mpNoteBody: string;
  mpNoteBody2Before: string;
  mpNoteBody2Link: string;
  mpNoteBody2After: string;
  mpLabel: string;
  mpPlaceholder: string;
  mpRosterUnavailable: string;
  mpRubricSectionTitle: string;
  mpRubricHelp: string;
  mpRubricAccessibility: string;
  mpRubricResponsiveness: string;
  mpRubricFollowThrough: string;
  mpRubricScaleHint: string;
  mpRubricOptional: string;
  govNoteTitle: string;
  govNoteBody: string;
  govNoteBody2Before: string;
  govNoteBody2Link: string;
  govNoteBody2After: string;
  shortTitle: string;
  shortTitlePlaceholder: string;
  bodyLabel: string;
  placeholders: VoiceReportFormPlaceholders;
  locationTitle: string;
  locationHelp: string;
  geoLoadingBanner: string;
  geoDeniedTitle: string;
  geoDeniedBody: string;
  geoErrorTitle: string;
  geoErrorBody: string;
  regionLabel: string;
  regionDetecting: string;
  regionDash: string;
  regionHelp: string;
  localAreaLabel: string;
  localAreaPlaceholderLoading: string;
  localAreaHelp: string;
  signedInFooter: string;
  evidenceLabel: string;
  evidenceOptional: string;
  evidenceHint: string;
  submitDisabledHint: string;
  submit: string;
  submitting: string;
};

const BASE_EN: VoiceReportFormStrings = {
  checkingSignIn: "Checking sign-in…",
  redirectingSignIn: "Redirecting to sign in…",
  onlineBanner:
    "You appear to be back online. Finish a pending draft below, then complete the security check and submit.",
  dismiss: "Dismiss",
  draftsOtherTypesBefore: "You have other saved drafts on this device for different report types. Open ",
  draftsOtherTypesLink: "Citizens Voice submit",
  draftsOtherTypesAfter: " to restore them.",
  pendingDraftsAria: "Pending drafts on this device",
  pendingDraftsTitle: "Pending drafts (this device)",
  pendingDraftsHint:
    "Restored drafts still need the security check before submit. Attachments are not stored offline.",
  restore: "Restore",
  discard: "Discard",
  successReportReceived: "Report received",
  successSituationalReceived: "Situational report received",
  saveTrackingCode: "Save your tracking code:",
  recordedPrefix: "Recorded",
  recordedSuffix: " (server time, Ghana programme use).",
  checkStatus: "Check status",
  openMpCommitmentSheet: "Open this MP’s commitment sheet on the parliamentary tracker",
  howWeUseTitle: "How we use your report",
  howWeUseLi1:
    "Staff triage submissions for moderation and follow-up; we may contact you if you left an email.",
  howWeUseLi2:
    "Your tracking code shows status updates as the team works the queue — not a court or regulator docket.",
  howWeUseLi3:
    "For formal complaints, use official channels (e.g. CHRAJ, sector regulators, or the courts) where they apply.",
  reportTypeLockedPrefix: "Report type:",
  reportTypeLabel: "Report type",
  kindVoice: "MBKRU Voice",
  kindMp: "MP performance",
  kindGov: "Government performance",
  kindSituational: "Situational alert",
  kindElection: "Election observation",
  electionNoteTitle: "Election-period reporting",
  electionNoteBody:
    "MBKRU is not the Electoral Commission or a court. This channel is for documentation and staff triage only — not a formal election petition, legal outcome, or official results challenge. Do not submit threats or knowingly false information.",
  mpNoteTitle: "MP performance",
  mpNoteBody:
    "Use this for your assessment of how an MP is serving the constituency — visibility, casework, accessibility, and accountability. You submit directly; staff moderate and triage like other Voice reports. This is not a formal Parliament petition or party complaint.",
  mpNoteBody2Before: "Choose the sitting MP in the list below so the intake links to their parliamentary tracker sheet and catalogue entry (same roster as ",
  mpNoteBody2Link: "Commitments by MP",
  mpNoteBody2After: ").",
  mpLabel: "Member of Parliament",
  mpPlaceholder: "Select an MP from the roster…",
  mpRosterUnavailable:
    "MP roster is unavailable (database or configuration). You cannot submit an MP performance report until the roster loads — refresh the page or try again later.",
  mpRubricSectionTitle: "Optional experience check-in (1–5)",
  mpRubricHelp:
    "These quick ratings are optional. They help staff sort structured citizen experience signals — they are not a formal score and do not replace the written report above.",
  mpRubricAccessibility: "Accessibility of your MP or their office",
  mpRubricResponsiveness: "Responsiveness to issues you raised",
  mpRubricFollowThrough: "Follow-through on commitments or casework",
  mpRubricScaleHint: "1 = poor · 5 = strong",
  mpRubricOptional: "Skip any row you prefer not to rate.",
  govNoteTitle: "Government performance",
  govNoteBody:
    "Use this for ministry, agency, or programme delivery you want documented — facts and observed outcomes, not speculation. MBKRU triages submissions; use official agency channels where you need a binding government response.",
  govNoteBody2Before: "These intakes are tracked alongside the public ",
  govNoteBody2Link: "Government commitments",
  govNoteBody2After: " lens on the same promise catalogue (programme-tagged executive rows).",
  shortTitle: "Short title",
  shortTitlePlaceholder: "Summarise your report in one line",
  bodyLabel: "What happened?",
  placeholders: {
    voice: "Describe facts, location, time, and who was involved. Avoid hearsay where possible.",
    mpPerf:
      "Name the MP where relevant. Describe what you observed on constituency service, accessibility, communication, or accountability — include dates, locations, and sources if you have them.",
    govPerf:
      "Name the ministry, agency, or programme. Describe what was expected versus what you observed on delivery — dates, locations, and factual detail.",
    election:
      "Describe what you observed at the polling station or process — stay factual; no threats or knowingly false claims.",
    situational: "Share observable facts: where, when, what happened, and who was affected if known.",
  },
  locationTitle: "Location (automatic)",
  locationHelp:
    "We request your browser location once when this form loads (W3C Geolocation). Coordinates are rounded (~1 km) for triage — not a surveyed boundary pin. The address line below comes from OpenStreetMap reverse geocoding (street or area names where available, plus town and region). Fields stay read-only so submissions match device permission and stay comparable for staff review.",
  geoLoadingBanner: "Detecting approximate location… allow the browser prompt if it appears.",
  geoDeniedTitle: "Location blocked — you cannot submit until it is allowed",
  geoDeniedBody:
    "Enable location for this site in your browser (address bar lock / site settings → Location → Allow). On mobile, turn on device location services. Then reload this page.",
  geoErrorTitle: "Location unavailable",
  geoErrorBody: "Try another browser or device, enable location services, then reload this page.",
  regionLabel: "Region",
  regionDetecting: "Detecting region…",
  regionDash: "—",
  regionHelp: "Set automatically from your rounded location.",
  localAreaLabel: "Approximate address (from map)",
  localAreaPlaceholderLoading: "Resolving address from map…",
  localAreaHelp:
    "Full formatted line from OpenStreetMap when available (still tied to rounded coordinates). © OpenStreetMap contributors.",
  signedInFooter:
    "Signed in — we'll use your account email for updates. If your profile has an E.164 mobile, SMS alerts may be sent when the organisation enables them.",
  evidenceLabel: "Evidence files",
  evidenceOptional: "(optional)",
  evidenceHint: "Up to {maxFiles} files, {maxMb} MB each — JPEG, PNG, WebP, or PDF.",
  submitDisabledHint:
    "Submit stays disabled until automatic location capture finishes (browser permission + area label).",
  submit: "Submit report",
  submitting: "Submitting…",
};

type Overlay = Partial<Omit<VoiceReportFormStrings, "placeholders">> & {
  placeholders?: Partial<VoiceReportFormPlaceholders>;
};

const OVERLAYS: Partial<Record<VoiceReportFormLangId, Overlay>> = {
  twi: {
    checkingSignIn: "Reyɛ login nhwehwɛ…",
    redirectingSignIn: "Redirekt ma login…",
    dismiss: "To mu",
    restore: "San fa",
    discard: "Pow",
    reportTypeLabel: "Report no ɛsɛ",
    shortTitle: "Ti tiakelen",
    bodyLabel: "Dɛn na ɛbaa?",
    locationTitle: "Beae (ɔtomatik)",
    regionLabel: "Mantam",
    submit: "Som report",
    submitting: "Resom…",
    kindVoice: "MBKRU Voice",
    kindMp: "MP dwumadi",
    kindGov: "ɔman dwumadi",
    kindSituational: "Tebea hintahu",
    kindElection: "aba abato nhwehwɛ",
    checkStatus: "Hwɛ tebea",
    mpLabel: "Parliament MP",
    mpPlaceholder: "Yi MP fi roster mu…",
    evidenceLabel: "Ahwɛ mu nhoma",
    evidenceOptional: "(ɔ ɛho nhima)",
    placeholders: {
      voice: "Kyerɛ ampa beae, bere, na nnipa a wɔka ho ma. Gyae kasakasa a wontumi nhunu.",
    },
  },
  ewe: {
    checkingSignIn: "Le login ɖi…",
    redirectingSignIn: "Ðo yi login…",
    dismiss: "Tu",
    restore: "Trɔ gbɔ",
    discard: "Ðo ɖi",
    reportTypeLabel: "Report ƒome",
    shortTitle: "Titina kpui",
    bodyLabel: "Nu ka xɔ?",
    locationTitle: "Teƒe (otomatik)",
    regionLabel: "Nutome",
    submit: "Ðo report",
    submitting: "Ðo…",
    kindVoice: "MBKRU Voice",
    kindMp: "MP nuwɔna",
    kindGov: "Government nuwɔna",
    kindSituational: "Nalawo xaxlɔ",
    kindElection: "Fiato kpɔkpɔ",
    checkStatus: "Kpɔ nyanya",
    mpLabel: "Parliament MP",
    mpPlaceholder: "Tia MP le roster…",
    evidenceLabel: "Evidence faïl",
    evidenceOptional: "(ɔ ɛho nhima)",
    placeholders: {
      voice: "Ðo nu si wowɔ, afi, esi, kple ame siwo li la nyanya.",
    },
  },
  hausa: {
    checkingSignIn: "Ana duba shiga…",
    redirectingSignIn: "Ana kai zuwa shiga…",
    dismiss: "Rufe sanarwa",
    restore: "Maido",
    discard: "Watsar da",
    reportTypeLabel: "Nau'in rahoto",
    shortTitle: "Take kadan",
    bodyLabel: "Me ya faru?",
    locationTitle: "Wuri (atomatik)",
    regionLabel: "Yanki",
    submit: "Aika rahoto",
    submitting: "Ana aika…",
    kindVoice: "MBKRU Voice",
    kindMp: "Ayyukan MP",
    kindGov: "Ayyukan gwamnati",
    kindSituational: "Faɗakarwar yanayi",
    kindElection: "Lura da zaɓe",
    checkStatus: "Duba matsayi",
    mpLabel: "Dan majalisar dokokin kasa",
    mpPlaceholder: "Zaɓi MP daga jerin…",
    evidenceLabel: "Fayilolin shaida",
    evidenceOptional: "(na zaɓi)",
    placeholders: {
      voice: "Bayyana ainihi wurin, lokacin, da masu shiga — guji bazuwar bayani.",
    },
  },
  ga: {
    submit: "Som report",
    submitting: "Resom…",
    kindVoice: "MBKRU Voice",
    kindMp: "MP performance",
    kindGov: "Government performance",
    kindSituational: "Situational alert",
    kindElection: "Election observation",
  },
  "en-gh": {},
};

export function getVoiceReportFormStrings(lang: VoiceReportFormLangId): VoiceReportFormStrings {
  const o = OVERLAYS[lang] ?? {};
  const ph = { ...BASE_EN.placeholders, ...(o.placeholders ?? {}) };
  const { placeholders: _p, ...rest } = o;
  return {
    ...BASE_EN,
    ...rest,
    placeholders: ph,
  };
}

export function kindOptionLabel(strings: VoiceReportFormStrings, kindValue: string): string {
  switch (kindValue) {
    case "VOICE":
      return strings.kindVoice;
    case "MP_PERFORMANCE":
      return strings.kindMp;
    case "GOVERNMENT_PERFORMANCE":
      return strings.kindGov;
    case "SITUATIONAL_ALERT":
      return strings.kindSituational;
    case "ELECTION_OBSERVATION":
      return strings.kindElection;
    default:
      return kindValue;
  }
}

export function bodyPlaceholderForKind(strings: VoiceReportFormStrings, kind: string): string {
  switch (kind) {
    case "MP_PERFORMANCE":
      return strings.placeholders.mpPerf;
    case "GOVERNMENT_PERFORMANCE":
      return strings.placeholders.govPerf;
    case "ELECTION_OBSERVATION":
      return strings.placeholders.election;
    case "SITUATIONAL_ALERT":
      return strings.placeholders.situational;
    default:
      return strings.placeholders.voice;
  }
}

export function formatEvidenceHint(strings: VoiceReportFormStrings, maxFiles: number, maxMb: number): string {
  return strings.evidenceHint.replace("{maxFiles}", String(maxFiles)).replace("{maxMb}", String(maxMb));
}
