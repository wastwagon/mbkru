import "server-only";

const DEFAULT_BASE_URL = "https://api-mergedataverification.hubtel.com";
const DEFAULT_VERIFY_PATH = "/v1/identityverify/ghanacard";

export type HubtelGhanaCardConfig = {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  verifyPath: string;
  timeoutMs: number;
  mockMode: boolean;
};

export function isHubtelGhanaCardConfigured(): boolean {
  if (process.env.HUBTEL_GHANA_CARD_MOCK === "1") return true;
  const id = process.env.HUBTEL_CLIENT_ID?.trim();
  const secret = process.env.HUBTEL_CLIENT_SECRET?.trim();
  return Boolean(id && secret);
}

export function getHubtelGhanaCardConfig(): HubtelGhanaCardConfig | null {
  const mockMode = process.env.HUBTEL_GHANA_CARD_MOCK === "1";
  if (mockMode) {
    if (process.env.NODE_ENV === "production") return null;
    return {
      clientId: "mock",
      clientSecret: "mock",
      baseUrl: DEFAULT_BASE_URL,
      verifyPath: DEFAULT_VERIFY_PATH,
      timeoutMs: 15_000,
      mockMode: true,
    };
  }

  const clientId = process.env.HUBTEL_CLIENT_ID?.trim();
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  const baseUrl = (process.env.HUBTEL_VERIFICATION_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, "");
  const verifyPath = process.env.HUBTEL_GHANA_CARD_VERIFY_PATH?.trim() || DEFAULT_VERIFY_PATH;
  const timeoutRaw = Number(process.env.HUBTEL_VERIFICATION_TIMEOUT_MS);
  const timeoutMs =
    Number.isFinite(timeoutRaw) && timeoutRaw >= 3_000 ? Math.min(timeoutRaw, 60_000) : 15_000;

  return { clientId, clientSecret, baseUrl, verifyPath, timeoutMs, mockMode: false };
}

/** When true, MP performance submit requires verified Ghana Card (default on). */
export function mpSubmitRequiresGhanaCard(): boolean {
  const raw = process.env.MBKRU_MP_SUBMIT_REQUIRES_GHANA_CARD?.trim().toLowerCase();
  if (raw === "0" || raw === "false" || raw === "no") return false;
  return true;
}

export function mpPerformanceCooldownDays(): number {
  const parsed = Number(process.env.MBKRU_MP_PERFORMANCE_COOLDOWN_DAYS);
  if (!Number.isFinite(parsed) || parsed <= 0) return 30;
  return Math.min(Math.max(Math.floor(parsed), 1), 365);
}
