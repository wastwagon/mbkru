/**
 * Offline / flaky-network draft queue for MBKRU Voice JSON submit payloads.
 * Stored in localStorage (device-local). Does not store file attachments.
 * Schema mirrors `@/lib/validation/reports` create body (sans Turnstile) without importing Prisma on the client.
 */

import { z } from "zod";

const STORAGE_KEY = "mbkru_report_queue_v1";
export const MAX_QUEUED_REPORTS = 5;

const reportKindSchema = z.enum([
  "VOICE",
  "SITUATIONAL_ALERT",
  "ELECTION_OBSERVATION",
  "MP_PERFORMANCE",
  "GOVERNMENT_PERFORMANCE",
]);

export const queuedReportPayloadSchema = z
  .object({
    kind: reportKindSchema,
    title: z.string().trim().min(5).max(300),
    body: z.string().trim().min(20).max(50_000),
    category: z.string().trim().max(120).optional(),
    regionId: z.string().cuid(),
    constituencyId: z.string().cuid().optional(),
    parliamentMemberId: z.string().cuid().optional(),
    localArea: z.string().trim().min(3).max(240),
    latitude: z.number().gte(-90).lte(90),
    longitude: z.number().gte(-180).lte(180),
    submitterEmail: z.string().trim().email().max(320).optional(),
    submitterPhone: z
      .string()
      .trim()
      .max(18)
      .optional()
      .transform((s) => (s && s.length > 0 ? s : undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.submitterPhone && !/^\+[1-9]\d{1,14}$/.test(data.submitterPhone)) {
      ctx.addIssue({
        code: "custom",
        message: "Use E.164 phone",
        path: ["submitterPhone"],
      });
    }
    if (data.kind === "MP_PERFORMANCE" && !data.parliamentMemberId?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Select the MP this report is about.",
        path: ["parliamentMemberId"],
      });
    }
  });

export type QueuedReportPayload = z.infer<typeof queuedReportPayloadSchema>;

export type ReportQueueItem = {
  id: string;
  createdAt: number;
  payload: QueuedReportPayload;
};

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function writeQueue(items: ReportQueueItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      throw new Error("STORAGE_FULL");
    }
    throw e;
  }
}

export function loadReportQueue(): ReportQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = safeJsonParse(raw);
    if (!Array.isArray(parsed)) return [];

    const out: ReportQueueItem[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const id = typeof r.id === "string" ? r.id : "";
      const createdAt = typeof r.createdAt === "number" ? r.createdAt : 0;
      const payloadCheck = queuedReportPayloadSchema.safeParse(r.payload);
      if (!id || !createdAt || !payloadCheck.success) continue;
      out.push({ id, createdAt, payload: payloadCheck.data });
    }
    return out.sort((a, b) => a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

/** Whether the HTTP response is worth saving for an offline-style retry (server or rate limits). */
export function isRetryableReportSubmitResponse(status: number): boolean {
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

export function enqueueReportDraft(payload: QueuedReportPayload): ReportQueueItem {
  if (typeof window === "undefined") {
    throw new Error("enqueueReportDraft requires a browser");
  }
  const parsed = queuedReportPayloadSchema.parse(payload);
  const item: ReportQueueItem = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    payload: parsed,
  };
  const current = loadReportQueue();
  const next = [...current, item].slice(-MAX_QUEUED_REPORTS);
  writeQueue(next);
  return item;
}

export function removeReportQueueItem(id: string) {
  if (typeof window === "undefined") return;
  const next = loadReportQueue().filter((x) => x.id !== id);
  writeQueue(next);
}

export function clearReportQueue() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
