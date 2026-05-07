import "server-only";

function retryAttempts(): number {
  const raw = Number.parseInt((process.env.NOTIFICATION_RETRY_ATTEMPTS ?? "0").trim(), 10);
  return Number.isFinite(raw) && raw > 0 ? Math.min(raw, 5) : 0;
}

function retryDelayMs(): number {
  const raw = Number.parseInt((process.env.NOTIFICATION_RETRY_DELAY_MS ?? "300").trim(), 10);
  return Number.isFinite(raw) && raw > 0 ? Math.min(raw, 10_000) : 300;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runWithNotificationRetries<T>(
  label: string,
  operation: () => Promise<T>,
): Promise<T> {
  const retries = retryAttempts();
  const baseDelay = retryDelayMs();
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (attempt >= retries) break;
      const waitMs = baseDelay * (attempt + 1);
      console.warn(`[notify-retry] ${label}: attempt ${attempt + 1} failed, retrying in ${waitMs}ms`);
      await sleep(waitMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`[notify-retry] ${label} failed`);
}
