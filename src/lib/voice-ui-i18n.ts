/**
 * UI strings for MBKRU Voice chat + accessibility voice panel (per chat language).
 * Synced with `voiceLanguageOptions` ids in `@/lib/voice-languages`.
 */
import { voiceLanguageOptions, type VoicePreferences } from "@/lib/voice-languages";

export type VoiceChromeLangId = VoicePreferences["languageId"];

export type VoiceChromeStrings = {
  chatIntro: string;
  helperFooter: string;
  quickPrompts: Array<{ label: string; prompt: string }>;
  ariaChatbot: string;
  srChatLanguage: string;
  ariaChatLanguage: string;
  readAloudTitleOn: string;
  readAloudTitleOff: string;
  readAloudAriaOn: string;
  readAloudAriaOff: string;
  clearChat: string;
  closeChatAria: string;
  thinking: string;
  transcribingStatus: string;
  aiDisclaimerBeforePrivacy: string;
  privacyLink: string;
  inputSrLabel: string;
  placeholder: string;
  remove: string;
  charactersSuffix: string;
  send: string;
  webSearchCheckbox: string;
  cloudAudioHeading: string;
  whisperMicCheckbox: string;
  openAiTtsCheckbox: string;
  cloudAudioFootnoteBeforePrivacy: string;
  sitePagesPrefix: string;
  webSearchUsedNote: string;
  asOfPrefix: string;
  launcherAria: string;
  launcherButton: string;
  micAriaWhisperStop: string;
  micAriaWhisperRecord: string;
  micAriaListening: string;
  micAriaBrowser: string;
  micTitleWhisperStop: string;
  micTitleWhisperRecord: string;
  micTitleListening: string;
  micTitleBrowser: string;
  attachAria: string;
  attachTitle: string;
  languageBadge: string;
  errMicInterrupted: string;
  errNoMic: string;
  errNoWhisperMime: string;
  errRecordingFailed: string;
  errNoAudio: string;
  errTranscribeRate: string;
  errTranscribeGeneric: string;
  errTranscribeReach: string;
  errMicPermission: string;
  noticeImageSize: string;
  noticeTextLarge: string;
  noticePdfSize: string;
  noticeAttachmentHint: string;
  noticeReadImageFail: string;
  noticeReadPdfFail: string;
};

export type AccessibilityVoiceStrings = {
  onboardingTitle: string;
  onboardingBody: string;
  onboardingGotIt: string;
  panelAria: string;
  panelTitle: string;
  panelSubtitle: string;
  closeAria: string;
  voiceLanguageLabel: string;
  speechSpeedLabel: string;
  cloudAudioHeading: string;
  whisperDictation: string;
  openAiReadAloud: string;
  cloudFootnoteBeforePrivacy: string;
  privacyLink: string;
  readMainContent: string;
  reading: string;
  stopReading: string;
  readSelected: string;
  sttDictate: string;
  sttListening: string;
  sttWhisperRecording: string;
  sttWhisperTranscribing: string;
  sttWhisperIdle: string;
  whisperTitleRecording: string;
  whisperTitleIdle: string;
  transcriptLabel: string;
  transcriptTranscribing: string;
  transcriptEmpty: string;
  sendToVoice: string;
  footerHint: string;
  selectTextFirst: string;
  sttBrowserError: string;
  errReadAloudUnavailable: string;
  errReadAloudNoSynth: string;
  ttsPagePrefix: string;
  ttsMainContentLead: string;
  ttsNoMainFull: string;
};

const voiceChromeByLang: Record<VoiceChromeLangId, VoiceChromeStrings> = {
  "en-gh": {
    chatIntro: "Hello. How can I help today?",
    helperFooter:
      "Ask by typing, mic, or attach an image, .txt, or PDF. Optional cloud mic and read-aloud appear when your host enables them. Use the checkbox below for live web search when available.",
    quickPrompts: [
      { label: "Track report", prompt: "Help me track my report status." },
      { label: "Diaspora", prompt: "I need the diaspora support hub: Ghana Card, passport, and official signposting." },
      { label: "Petition", prompt: "How do I start a new petition?" },
      { label: "Contact", prompt: "How can I contact MBKRU support?" },
    ],
    ariaChatbot: "MBKRU Voice chatbot",
    srChatLanguage: "Chat language",
    ariaChatLanguage: "Chat language",
    readAloudTitleOn: "Read-aloud is on",
    readAloudTitleOff: "Read-aloud is off",
    readAloudAriaOn: "Read assistant replies aloud: on",
    readAloudAriaOff: "Read assistant replies aloud: off",
    clearChat: "Clear",
    closeChatAria: "Close chat",
    thinking: "Thinking…",
    transcribingStatus: "Transcribing audio…",
    aiDisclaimerBeforePrivacy: "AI-assisted. Avoid highly sensitive data.",
    privacyLink: "Privacy",
    inputSrLabel: "Ask MBKRU Voice",
    placeholder: "Ask a question…",
    remove: "Remove",
    charactersSuffix: "characters",
    send: "Send",
    webSearchCheckbox: "Search the web (live) when supported",
    cloudAudioHeading: "Cloud audio (OpenAI)",
    whisperMicCheckbox: "Whisper for mic (sends a short recording to transcribe)",
    openAiTtsCheckbox: "OpenAI voice for read-aloud (speaker icon still toggles playback)",
    cloudAudioFootnoteBeforePrivacy:
      "Uses your API key on the server; may incur usage. Avoid sensitive speech.",
    sitePagesPrefix: "This site:",
    webSearchUsedNote: "Live web search was used for this reply; verify time-sensitive facts.",
    asOfPrefix: "As of",
    launcherAria: "Open MBKRU Voice chatbot",
    launcherButton: "MBKRU Voice",
    micAriaWhisperStop: "Stop recording and transcribe",
    micAriaWhisperRecord: "Record with Whisper (cloud transcription)",
    micAriaListening: "Listening to microphone input",
    micAriaBrowser: "Use microphone voice input",
    micTitleWhisperStop: "Stop — send to Whisper",
    micTitleWhisperRecord: "Whisper mic (tap again to stop)",
    micTitleListening: "Listening…",
    micTitleBrowser: "Browser voice input",
    attachAria: "Attach image, text file, or PDF",
    attachTitle: "Photo, .txt, or PDF",
    languageBadge: "EN",
    errMicInterrupted: "Mic interrupted. You can type instead.",
    errNoMic: "Microphone is not available in this browser.",
    errNoWhisperMime: "This browser cannot record audio for Whisper. Try Chrome or Edge.",
    errRecordingFailed: "Recording failed. Try again or type your message.",
    errNoAudio: "No audio captured. Try again.",
    errTranscribeRate: "Please wait a moment and try again.",
    errTranscribeGeneric: "Could not transcribe. Type instead.",
    errTranscribeReach: "Could not reach the transcription service.",
    errMicPermission: "Microphone permission denied or unavailable.",
    noticeImageSize: "Images must be about 1.25 MB or smaller for the AI to accept them.",
    noticeTextLarge: "Text file is too large — try a smaller .txt (under 40,000 characters).",
    noticePdfSize: "PDFs must be 1 MB or smaller.",
    noticeAttachmentHint: "Use an image, a .txt file, or a PDF.",
    noticeReadImageFail: "Could not read the image. Try a smaller file.",
    noticeReadPdfFail: "Could not read the PDF. Try a smaller file.",
  },
  twi: {
    chatIntro: "Maakye. Ɛdeɛn na metumi boa wo nnɛ?",
    helperFooter:
      "Tumi akyerɛw, microphone, anaa fa foto, .txt, anaa PDF ka ho. Web nhwehwɛmu no wɔ ase ha sɛ ɛho kwan wɔ.",
    quickPrompts: [
      { label: "Hwɛ report", prompt: "Boa me ma menhwe me report no status." },
      { label: "Diaspora", prompt: "Mepɛ diaspora support: Ghana Card, passport, ne ɔfisyial signposting." },
      { label: "Petition", prompt: "Mɛyɛ dɛn ahyɛ petition foforo ase?" },
      { label: "Contact", prompt: "Mɛyɛ dɛn akasa akyerɛ MBKRU support?" },
    ],
    ariaChatbot: "MBKRU Voice nkɔmbɔdtuo",
    srChatLanguage: "Kasa kasa",
    ariaChatLanguage: "Kasa kasa",
    readAloudTitleOn: "Kenkan da so",
    readAloudTitleOff: "Kenkan dwira",
    readAloudAriaOn: "Kenkan mmuaeɛ a ɛfiri ɔboafoɔ no so: da",
    readAloudAriaOff: "Kenkan mmuaeɛ a ɛfiri ɔboafoɔ no so: dwira",
    clearChat: "Popa",
    closeChatAria: "To nkɔmbɔdtuo no mu",
    thinking: "Rɛdwene…",
    transcribingStatus: "Rekyerɛwe nsɛm…",
    aiDisclaimerBeforePrivacy: "AI boa. Nnyɛ infɔmehyɛn titiriw.",
    privacyLink: "Sumsɛm",
    inputSrLabel: "Bisa MBKRU Voice",
    placeholder: "Bisa asɛm bi…",
    remove: "Yi",
    charactersSuffix: "nhoma",
    send: "Som",
    webSearchCheckbox: "Hwehwɛ web no (live) sɛ ɛboa",
    cloudAudioHeading: "Cloud audio (OpenAI)",
    whisperMicCheckbox: "Whisper ma microphone",
    openAiTtsCheckbox: "OpenAI nne ma kenkan",
    cloudAudioFootnoteBeforePrivacy: "API key wɔ server so; sika ba a ɛtumi ba.",
    sitePagesPrefix: "Website yi:",
    webSearchUsedNote: "Web nhwehwɛmu no wɔ mmuaeɛ yi mu; si nhoma pa ano.",
    asOfPrefix: "Bere",
    launcherAria: "Bue MBKRU Voice",
    launcherButton: "MBKRU Voice",
    micAriaWhisperStop: "Gyae kenkan na kyɛfa",
    micAriaWhisperRecord: "Kenkyɛɛ gyae Whisper",
    micAriaListening: "Retie microphone",
    micAriaBrowser: "Fa microphone",
    micTitleWhisperStop: "Gyae — som ma Whisper",
    micTitleWhisperRecord: "Whisper mic",
    micTitleListening: "Retie…",
    micTitleBrowser: "Browser microphone",
    attachAria: "Ka foto, .txt, anaa PDF",
    attachTitle: "Foto, .txt, anaa PDF",
    languageBadge: "TWI",
    errMicInterrupted: "Microphone gyinae. Tumi akyerɛw.",
    errNoMic: "Microphone nni browser yi mu.",
    errNoWhisperMime: "Browser yi nnim Whisper audio. Chrome anaa Edge.",
    errRecordingFailed: "Kenkan antumi. San bra anaa akyerɛw.",
    errNoAudio: "Audio nnipa. San bra.",
    errTranscribeRate: "Twɛn kakra na san bra.",
    errTranscribeGeneric: "Antumi antwerɛ. Akyerɛw.",
    errTranscribeReach: "Antumi mmfa transcription service.",
    errMicPermission: "Microphone tumi nnipa.",
    noticeImageSize: "Nhoma adeɛ no ɛsɛ yɛ ~1.25 MB anaaso ketew.",
    noticeTextLarge: ".txt no dodow — fa ketew a ahodo adu 40,000.",
    noticePdfSize: "PDF no ɛsɛ yɛ 1 MB anaaso ketew.",
    noticeAttachmentHint: "Fa foto, .txt, anaa PDF.",
    noticeReadImageFail: "Antumi annkan foto no. Fa ketew.",
    noticeReadPdfFail: "Antumi annkan PDF no. Fa ketew.",
  },
  ga: {
    chatIntro: "Mii gbo. Nɔɛ nɛ ekɛ ehao kɛ nɛ?",
    helperFooter:
      "O nyɛ ŋ tsɛɛ lɛ, mic, alo fa foto, .txt, alo PDF. Web nhwehwɛmu ase ha.",
    quickPrompts: [
      { label: "Hwɛ report", prompt: "Nyɛ mi boi ni mi kɛ mi report status." },
      { label: "Diaspora", prompt: "Mii ni diaspora support: Ghana Card, passport, ni official signposting." },
      { label: "Petition", prompt: "Mitsɛ ni maba petition tsui?" },
      { label: "Contact", prompt: "Mitsɛ ni mika MBKRU support hewalɛ?" },
    ],
    ariaChatbot: "MBKRU Voice conversation",
    srChatLanguage: "Gɔŋ gɔŋ",
    ariaChatLanguage: "Gɔŋ gɔŋ",
    readAloudTitleOn: "Kenkan le",
    readAloudTitleOff: "Kenkan pa",
    readAloudAriaOn: "Kenkan response shishi le",
    readAloudAriaOff: "Kenkan response shishi pa",
    clearChat: "Yi",
    closeChatAria: "To conversation lo",
    thinking: "E nyɛ mi ja…",
    transcribingStatus: "E tsɔɔ fo…",
    aiDisclaimerBeforePrivacy: "AI boi. Mi ja sensitive nyɛ.",
    privacyLink: "Privacy",
    inputSrLabel: "Bisa MBKRU Voice",
    placeholder: "Bisa nyɛmi…",
    remove: "Yi",
    charactersSuffix: "characters",
    send: "Som",
    webSearchCheckbox: "Search web (live) ni e nyɛ bo",
    cloudAudioHeading: "Cloud audio (OpenAI)",
    whisperMicCheckbox: "Whisper ma mic",
    openAiTtsCheckbox: "OpenAI nɔ ma kenkan",
    cloudAudioFootnoteBeforePrivacy: "API key le server he; costs ba.",
    sitePagesPrefix: "Website ni:",
    webSearchUsedNote: "Web search kɛ response ni; verify facts.",
    asOfPrefix: "Ni date",
    launcherAria: "We MBKRU Voice",
    launcherButton: "MBKRU Voice",
    micAriaWhisperStop: "Stop recording ni transcribe",
    micAriaWhisperRecord: "Record ni Whisper",
    micAriaListening: "E nyɛ mi te microphone",
    micAriaBrowser: "Fa microphone",
    micTitleWhisperStop: "Stop — som Whisper",
    micTitleWhisperRecord: "Whisper mic",
    micTitleListening: "E te…",
    micTitleBrowser: "Browser mic",
    attachAria: "Fa foto, .txt, alo PDF",
    attachTitle: "Foto, .txt, alo PDF",
    languageBadge: "GA",
    errMicInterrupted: "Mic pa. O nyɛ ŋ tsɛɛ.",
    errNoMic: "Mic nɔ browser ni.",
    errNoWhisperMime: "Browser ni Whisper audio. Chrome alo Edge.",
    errRecordingFailed: "Recording pa. San bra alo tsɛɛ.",
    errNoAudio: "Audio pa. San bra.",
    errTranscribeRate: "Twɛn small san bra.",
    errTranscribeGeneric: "Antranscribe. Tsɛɛ.",
    errTranscribeReach: "Antumi reach transcription.",
    errMicPermission: "Mic permission pa.",
    noticeImageSize: "Foto no ɛyɛ ~1.25 MB alo small.",
    noticeTextLarge: ".txt dodow — fa small under 40,000.",
    noticePdfSize: "PDF no ɛyɛ 1 MB alo small.",
    noticeAttachmentHint: "Fa foto, .txt, alo PDF.",
    noticeReadImageFail: "Antumi kan foto. Fa small.",
    noticeReadPdfFail: "Antumi kan PDF. Fa small.",
  },
  hausa: {
    chatIntro: "Sannu. Yaya zan taimake ku yau?",
    helperFooter:
      "Rubutu, makirufo, ko haɗa hoto, .txt, ko PDF. Binciken yanar gizo a ƙasa idan akwai.",
    quickPrompts: [
      { label: "Duba rahoto", prompt: "Taimaka min duba matsayin rahotona." },
      { label: "Diaspora", prompt: "Ina buƙatar tallafin diaspora: Ghana Card, fasfo, da official channels." },
      { label: "Fara petition", prompt: "Ta yaya zan fara sabon petition?" },
      { label: "Tuntuɓa", prompt: "Ta yaya zan tuntuɓi MBKRU support?" },
    ],
    ariaChatbot: "MBKRU Voice taɗi",
    srChatLanguage: "Harshen taɗi",
    ariaChatLanguage: "Harshen taɗi",
    readAloudTitleOn: "Karatu bayyana",
    readAloudTitleOff: "Karatu kashe",
    readAloudAriaOn: "Karatun amsoshin mai taimako: kunna",
    readAloudAriaOff: "Karatun amsoshin mai taimako: kashe",
    clearChat: "Share",
    closeChatAria: "Rufe taɗi",
    thinking: "Tunanin…",
    transcribingStatus: "Ana rubuta sautin…",
    aiDisclaimerBeforePrivacy: "AI taimako. Guji bayanai masu tsanani.",
    privacyLink: "Sirri",
    inputSrLabel: "Tambaya MBKRU Voice",
    placeholder: "Yi tambaya…",
    remove: "Cire",
    charactersSuffix: "haruffa",
    send: "Aika",
    webSearchCheckbox: "Bincika yanar gizo (live) idan yana da tallafi",
    cloudAudioHeading: "Cloud audio (OpenAI)",
    whisperMicCheckbox: "Whisper don makirufo",
    openAiTtsCheckbox: "OpenAI murya don karatu",
    cloudAudioFootnoteBeforePrivacy: "API key akan server; ana iya biyan kuɗi.",
    sitePagesPrefix: "Wannan shafin:",
    webSearchUsedNote: "An yi binciken yanar gizo ga wannan amsa; tabbatar da bayanai.",
    asOfPrefix: "Kamar yadda",
    launcherAria: "Buɗe MBKRU Voice",
    launcherButton: "MBKRU Voice",
    micAriaWhisperStop: "Tsaya rikodin kuma transcribe",
    micAriaWhisperRecord: "Yi rikodin da Whisper",
    micAriaListening: "Ana sauraron makirufo",
    micAriaBrowser: "Yi amfani da makirufo",
    micTitleWhisperStop: "Tsaya — aika ga Whisper",
    micTitleWhisperRecord: "Whisper mic",
    micTitleListening: "Ana saurare…",
    micTitleBrowser: "Browser makirufo",
    attachAria: "Haɗa hoto, .txt, ko PDF",
    attachTitle: "Hoto, .txt, ko PDF",
    languageBadge: "HA",
    errMicInterrupted: "An katse makirufo. Rubutu.",
    errNoMic: "Babu makirufo a wannan burauzar.",
    errNoWhisperMime: "Burauzar ba ta Whisper kyauta. Chrome ko Edge.",
    errRecordingFailed: "Rikodin ya gaza. Sake ko rubutu.",
    errNoAudio: "Babu sautin. Sake.",
    errTranscribeRate: "Jira kaɗan ka sake.",
    errTranscribeGeneric: "Ba transcribe. Rubutu.",
    errTranscribeReach: "Ba za a iya transcription ba.",
    errMicPermission: "Izinin makirufo ba ya yi ba.",
    noticeImageSize: "Hotuna dole ~1.25 MB ko ƙasa.",
    noticeTextLarge: ".txt babban — yi ƙaramin under 40,000.",
    noticePdfSize: "PDF dole 1 MB ko ƙasa.",
    noticeAttachmentHint: "Yi amfani da hoto, .txt, ko PDF.",
    noticeReadImageFail: "Ba za a iya hoton ba. Yi ƙarami.",
    noticeReadPdfFail: "Ba za a iya PDF ba. Yi ƙarami.",
  },
  ewe: {
    chatIntro: "Woé zɔ. Nu ka bo nyanyui la fifia?",
    helperFooter:
      "Nà ŋlɔ alo mic alo na foto, .txt, alo PDF. Web search anyi gɔme la ne èlékpɔ enɔ.",
    quickPrompts: [
      { label: "Kpɔ report", prompt: "Kpe ɖe ŋunye be maƒo report status." },
      { label: "Diaspora", prompt: "Mele diaspora support: Ghana Card, passport, kple official signposting." },
      { label: "Petition", prompt: "Aleke maɖe petition yeye gɔme?" },
      { label: "Contact", prompt: "Aleke maate ŋu akpa nu kple MBKRU support?" },
    ],
    ariaChatbot: "MBKRU Voice nyonyome",
    srChatLanguage: "Gbebubu",
    ariaChatLanguage: "Gbebubu",
    readAloudTitleOn: "Xlẽ le eme",
    readAloudTitleOff: "Xlẽ mele eme o",
    readAloudAriaOn: "Xlẽ didi le gbɔglɔme la: eme",
    readAloudAriaOff: "Xlẽ didi le gbɔglɔme la: mele eme o",
    clearChat: "Ðo ɖe eye",
    closeChatAria: "Tu nyonyome la",
    thinking: "Le bum…",
    transcribingStatus: "Le nuŋlɔla nutata…",
    aiDisclaimerBeforePrivacy: "AI li boa. Mega nu si titina.",
    privacyLink: "Privacy",
    inputSrLabel: "Bia MBKRU Voice",
    placeholder: "Bia nu…",
    remove: "Ðo ɖa",
    charactersSuffix: "nuŋlɔla",
    send: "Ðo",
    webSearchCheckbox: "Di web (live) ne èlékpɔ la",
    cloudAudioHeading: "Cloud audio (OpenAI)",
    whisperMicCheckbox: "Whisper na mic",
    openAiTtsCheckbox: "OpenAI nu na xlẽ",
    cloudAudioFootnoteBeforePrivacy: "API key le server dzi; ga home kɔsto.",
    sitePagesPrefix: "Site sia:",
    webSearchUsedNote: "Web search zɔ didi sia me; verify nuwo.",
    asOfPrefix: "Le esia",
    launcherAria: "Yi MBKRU Voice",
    launcherButton: "MBKRU Voice",
    micAriaWhisperStop: "Tu recording eye transcribe",
    micAriaWhisperRecord: "Record kple Whisper",
    micAriaListening: "Le microphone",
    micAriaBrowser: "Zã microphone",
    micTitleWhisperStop: "Tu — Ðo na Whisper",
    micTitleWhisperRecord: "Whisper mic",
    micTitleListening: "Le…",
    micTitleBrowser: "Browser mic",
    attachAria: "Na foto, .txt, alo PDF",
    attachTitle: "Foto, .txt, alo PDF",
    languageBadge: "EWE",
    errMicInterrupted: "Mic tu. Ŋlɔ nu.",
    errNoMic: "Mic menɔ browser sia me o.",
    errNoWhisperMime: "Browser sia menɔ Whisper. Chrome alo Edge.",
    errRecordingFailed: "Recording ma wɔ o. Gbugbɔ alo ŋlɔ.",
    errNoAudio: "Audio menɔ o. Gbugbɔ.",
    errTranscribeRate: "Lã ake eye gbugbɔ.",
    errTranscribeGeneric: "Transcribe ma wɔ o. Ŋlɔ.",
    errTranscribeReach: "Transcription service mekpɔ o.",
    errMicPermission: "Mic permission mekpɔ o.",
    noticeImageSize: "Foto menɔ ~1.25 MB alo nu kpɔ.",
    noticeTextLarge: ".txt li bo — na kpɔ under 40,000.",
    noticePdfSize: "PDF menɔ 1 MB alo nu kpɔ.",
    noticeAttachmentHint: "Na foto, .txt, alo PDF.",
    noticeReadImageFail: "Image ma ŋu read o. Na kpɔ.",
    noticeReadPdfFail: "PDF ma ŋu read o. Na kpɔ.",
  },
};

const accessibilityByLang: Record<VoiceChromeLangId, AccessibilityVoiceStrings> = {
  "en-gh": {
    onboardingTitle: "Accessibility & voice",
    onboardingBody: "Use the access symbol in the header (next to the menu) for read-aloud and dictation.",
    onboardingGotIt: "Got it",
    panelAria: "Accessibility voice tools",
    panelTitle: "Voice & reading",
    panelSubtitle: "Read aloud and dictation for this page. Press Escape or Close.",
    closeAria: "Close accessibility voice tools",
    voiceLanguageLabel: "Voice language",
    speechSpeedLabel: "Speech speed",
    cloudAudioHeading: "Cloud audio (OpenAI)",
    whisperDictation: "Whisper for dictation",
    openAiReadAloud: "OpenAI voice for read-aloud",
    cloudFootnoteBeforePrivacy: "Server-held API key; may incur usage.",
    privacyLink: "Privacy",
    readMainContent: "Read main content",
    reading: "Reading…",
    stopReading: "Stop reading",
    readSelected: "Read selected text",
    sttDictate: "Speech to text (dictate)",
    sttListening: "Listening…",
    sttWhisperRecording: "Recording…",
    sttWhisperTranscribing: "Transcribing...",
    sttWhisperIdle: "Speech to text (Whisper)",
    whisperTitleRecording: "Stop — send to Whisper",
    whisperTitleIdle: "Whisper dictation — tap again to stop",
    transcriptLabel: "Transcript",
    transcriptTranscribing: "Transcribing audio…",
    transcriptEmpty: "Your captured speech will appear here.",
    sendToVoice: "Send transcript to MBKRU Voice",
    footerHint: "If voice is unavailable, use the keyboard and regular forms. Language packs vary by device.",
    selectTextFirst: "Select text on the page first, then use Read selected text.",
    sttBrowserError:
      "Browser speech recognition did not complete. Enable “Whisper for dictation” below if OpenAI is configured on the server, grant the microphone permission, or type with the keyboard.",
    errReadAloudUnavailable: "Read-aloud is not available right now.",
    errReadAloudNoSynth: "Read-aloud is not supported in this browser.",
    ttsPagePrefix: "Page",
    ttsMainContentLead: "Main content:",
    ttsNoMainFull:
      "No main content was detected — select text and use Read selected text, or navigate to another page.",
  },
  twi: {
    onboardingTitle: "Accessibility ne voice",
    onboardingBody: "Fa access icon a header mu (menu nkyɛn) ma kenkan ne nhomasua.",
    onboardingGotIt: "Mate ase",
    panelAria: "Accessibility voice nneɛma",
    panelTitle: "Voice ne kenkan",
    panelSubtitle: "Kenkan ne nhomasua ma kratafa yi. Escape anaa Close.",
    closeAria: "To accessibility panel no mu",
    voiceLanguageLabel: "Voice kasa",
    speechSpeedLabel: "Kenkan bere",
    cloudAudioHeading: "Cloud audio (OpenAI)",
    whisperDictation: "Whisper ma nhomasua",
    openAiReadAloud: "OpenAI nne ma kenkan",
    cloudFootnoteBeforePrivacy: "API key wɔ server; sika tumi ba.",
    privacyLink: "Sumsɛm",
    readMainContent: "Kenkan dwumadi titiriw",
    reading: "Rekenkan…",
    stopReading: "Gyae kenkan",
    readSelected: "Kenkan nsɛm a wɔapaw",
    sttDictate: "Kasa ben nhomasua",
    sttListening: "Retie…",
    sttWhisperRecording: "Rekenkan…",
    sttWhisperTranscribing: "Rekyerɛwe…",
    sttWhisperIdle: "Kasa ben nhomasua (Whisper)",
    whisperTitleRecording: "Gyae — som Whisper",
    whisperTitleIdle: "Whisper nhomasua",
    transcriptLabel: "Nsɛm a wɔate",
    transcriptTranscribing: "Rekyerɛwe audio…",
    transcriptEmpty: "Nsɛm a wɔate bɛba ha.",
    sendToVoice: "Som nsɛm no kɔ MBKRU Voice",
    footerHint: "Sɛ voice nni hɔ a, fa keyboard. Device nyinaa nyɛ pɛ.",
    selectTextFirst: "Tow nsɛm no so kan kan, na fa Read selected.",
    sttBrowserError:
      "Browser nhomasua antumi. Yɛ Whisper ma nhomasua sɛ OpenAI wɔ server so, anaa fa keyboard.",
    errReadAloudUnavailable: "Kenkan antumi mmfa saa bere yi.",
    errReadAloudNoSynth: "Browser yi nnim kenkan.",
    ttsPagePrefix: "Kratafa",
    ttsMainContentLead: "Dwuma titiriw:",
    ttsNoMainFull: "Entumi nhwehwɛ mu kontent — paw nsɛm na fa Read selected, anaa kɔ kratafa foforo.",
  },
  ga: {
    onboardingTitle: "Accessibility kɛ voice",
    onboardingBody: "Fa access icon a header (menu nɔ) ma kenkan kɛ dictation.",
    onboardingGotIt: "Mate",
    panelAria: "Accessibility voice tools",
    panelTitle: "Voice kɛ kenkan",
    panelSubtitle: "Kenkan kɛ dictation ma page yi. Escape anaa Close.",
    closeAria: "To panel ni",
    voiceLanguageLabel: "Voice gɔŋ",
    speechSpeedLabel: "Kenkan speed",
    cloudAudioHeading: "Cloud audio (OpenAI)",
    whisperDictation: "Whisper ma dictation",
    openAiReadAloud: "OpenAI nɔ ma kenkan",
    cloudFootnoteBeforePrivacy: "API key le server he.",
    privacyLink: "Privacy",
    readMainContent: "Kenkan main content",
    reading: "E kenkan…",
    stopReading: "Tu kenkan",
    readSelected: "Kenkan selected text",
    sttDictate: "Speech to text (dictate)",
    sttListening: "E te…",
    sttWhisperRecording: "Recording…",
    sttWhisperTranscribing: "Transcribing...",
    sttWhisperIdle: "Speech to text (Whisper)",
    whisperTitleRecording: "Stop — som Whisper",
    whisperTitleIdle: "Whisper dictation",
    transcriptLabel: "Transcript",
    transcriptTranscribing: "E transcribe audio…",
    transcriptEmpty: "Speech le ba ha.",
    sendToVoice: "Som transcript kɔ MBKRU Voice",
    footerHint: "Sɛ voice mele a, fa keyboard.",
    selectTextFirst: "Select text kan kan.",
    sttBrowserError: "Browser recognition antumi. Try Whisper anaa keyboard.",
    errReadAloudUnavailable: "Kenkan mele o.",
    errReadAloudNoSynth: "Browser mele kenkan o.",
    ttsPagePrefix: "Page",
    ttsMainContentLead: "Main content:",
    ttsNoMainFull: "Content mele me — select text kɛ read selected.",
  },
  hausa: {
    onboardingTitle: "Accessibility da murya",
    onboardingBody: "Yi alamar dama a cikin header don karatu da rubutu ta harshen sautin.",
    onboardingGotIt: "Na gane",
    panelAria: "Kayayyakin murya na accessibility",
    panelTitle: "Murya da karatu",
    panelSubtitle: "Karatu da rubutu ta sautin don wannan shafin. Escape ko Close.",
    closeAria: "Rufe panel",
    voiceLanguageLabel: "Harshen murya",
    speechSpeedLabel: "Gudun karatu",
    cloudAudioHeading: "Cloud audio (OpenAI)",
    whisperDictation: "Whisper don rubutu ta sautin",
    openAiReadAloud: "OpenAI murya don karatu",
    cloudFootnoteBeforePrivacy: "API key akan server.",
    privacyLink: "Sirri",
    readMainContent: "Karatun babban abun ciki",
    reading: "Ana karatu…",
    stopReading: "Tsaya karatu",
    readSelected: "Karatun rubutun da aka zaɓa",
    sttDictate: "Magana zuwa rubutu",
    sttListening: "Ana saurare…",
    sttWhisperRecording: "Ana rikodi…",
    sttWhisperTranscribing: "Ana rubuta…",
    sttWhisperIdle: "Magana zuwa rubutu (Whisper)",
    whisperTitleRecording: "Tsaya — aika Whisper",
    whisperTitleIdle: "Whisper rubutu",
    transcriptLabel: "Rubutun sautin",
    transcriptTranscribing: "Ana rubuta sautin…",
    transcriptEmpty: "Rubutun sautin zai bayyana nan.",
    sendToVoice: "Aika rubutu zuwa MBKRU Voice",
    footerHint: "Idan murya ba ta yi ba, yi amfani da madanni.",
    selectTextFirst: "Zaɓi rubutu a shafin da farko.",
    sttBrowserError: "Browser ba ya gama. Gwada Whisper ko madanni.",
    errReadAloudUnavailable: "Karatu ba ya samu yanzu.",
    errReadAloudNoSynth: "Wannan burauzar ba ta karatu.",
    ttsPagePrefix: "Shafi",
    ttsMainContentLead: "Babban abun ciki:",
    ttsNoMainFull: "Babu babban abun ciki — zaɓi rubutu kuma yi karatu.",
  },
  ewe: {
    onboardingTitle: "Accessibility kple voice",
    onboardingBody: "Zã access icon le header la na xlẽ kple nuŋlɔla.",
    onboardingGotIt: "Ekpo",
    panelAria: "Accessibility voice tools",
    panelTitle: "Voice kple xlẽ",
    panelSubtitle: "Xlẽ kple nuŋlɔla na site sia. Escape alo Close.",
    closeAria: "Tu panel la",
    voiceLanguageLabel: "Voice gbegbe",
    speechSpeedLabel: "Xlẽ ƒoƒo",
    cloudAudioHeading: "Cloud audio (OpenAI)",
    whisperDictation: "Whisper na nuŋlɔla",
    openAiReadAloud: "OpenAI nu na xlẽ",
    cloudFootnoteBeforePrivacy: "API key le server dzi.",
    privacyLink: "Privacy",
    readMainContent: "Xlẽ nutata titiniwo",
    reading: "Le xlẽm…",
    stopReading: "Tu xlẽ",
    readSelected: "Xlẽ nu si woɖo la",
    sttDictate: "Nu ben nuŋlɔla",
    sttListening: "Le…",
    sttWhisperRecording: "Le recording…",
    sttWhisperTranscribing: "Le transcribe…",
    sttWhisperIdle: "Nu ben nuŋlɔla (Whisper)",
    whisperTitleRecording: "Tu — Ðo Whisper",
    whisperTitleIdle: "Whisper nuŋlɔla",
    transcriptLabel: "Nutata",
    transcriptTranscribing: "Le transcribe audio…",
    transcriptEmpty: "Nutata si woate la ana bra.",
    sendToVoice: "Ðo transcript yi MBKRU Voice",
    footerHint: "Ne voice mekpɔ o la, zã keyboard.",
    selectTextFirst: "Ɖo nu kan kan.",
    sttBrowserError: "Browser recognition mekpɔ o. Whisper alo keyboard.",
    errReadAloudUnavailable: "Xlẽ mekpɔ o fifia.",
    errReadAloudNoSynth: "Browser sia mekpɔ xlẽ o.",
    ttsPagePrefix: "Nuƒoƒo",
    ttsMainContentLead: "Nutata titini:",
    ttsNoMainFull:
      "Nutata mekpɔ o — ɖo nu eye zã Read selected, alo yi nuƒoƒo bubu.",
  },
};

/** Human-readable language names in the picker, keyed by current UI language × option id. */
const VOICE_LANGUAGE_MENU_LABELS: Record<
  VoiceChromeLangId,
  Record<VoiceChromeLangId, string>
> = {
  "en-gh": {
    "en-gh": "English (Ghana)",
    twi: "Twi (Akan)",
    ga: "Ga",
    hausa: "Hausa",
    ewe: "Ewe",
  },
  twi: {
    "en-gh": "Borɔfo (Ghana)",
    twi: "Twi / Akan",
    ga: "Ga",
    hausa: "Hausa",
    ewe: "Eʋegbe",
  },
  ga: {
    "en-gh": "English (Ghana)",
    twi: "Twi (Akan)",
    ga: "Ga",
    hausa: "Hausa",
    ewe: "Ewe",
  },
  hausa: {
    "en-gh": "Turanci (Ghana)",
    twi: "Twi (Akan)",
    ga: "Ga",
    hausa: "Hausa",
    ewe: "Ewe",
  },
  ewe: {
    "en-gh": "English (Ghana)",
    twi: "Twi (Akan)",
    ga: "Ga",
    hausa: "Hausa",
    ewe: "Eʋegbe",
  },
};

/**
 * Label shown for each language `<option>` when the Voice/accessibility UI is in `uiLang`.
 */
export function voiceLanguageMenuLabel(
  uiLang: VoiceChromeLangId,
  optionId: VoiceChromeLangId,
): string {
  const row = VOICE_LANGUAGE_MENU_LABELS[uiLang] ?? VOICE_LANGUAGE_MENU_LABELS["en-gh"];
  const label = row[optionId];
  if (label) return label;
  return voiceLanguageOptions.find((o) => o.id === optionId)?.label ?? optionId;
}

export function getVoiceChromeStrings(langId: VoiceChromeLangId): VoiceChromeStrings {
  return voiceChromeByLang[langId] ?? voiceChromeByLang["en-gh"];
}

export function getAccessibilityVoiceStrings(langId: VoiceChromeLangId): AccessibilityVoiceStrings {
  return accessibilityByLang[langId] ?? accessibilityByLang["en-gh"];
}

/** BCP 47 tag for formatting dates in meta footer (best-effort per UI language). */
export function voiceUiDateLocale(langId: VoiceChromeLangId): string {
  switch (langId) {
    case "twi":
      return "ak-GH";
    case "ga":
      return "gaa-GH";
    case "hausa":
      return "ha-GH";
    case "ewe":
      return "ee-GH";
    default:
      return "en-GH";
  }
}
