import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  MAX_QUEUED_REPORTS,
  clearReportQueue,
  enqueueReportDraft,
  isRetryableReportSubmitResponse,
  loadReportQueue,
  queuedReportPayloadSchema,
  removeReportQueueItem,
} from "./report-submit-queue";

const store: Record<string, string> = {};

beforeEach(() => {
  const ls = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
  };
  vi.stubGlobal("crypto", { randomUUID: () => "test-uuid-" + Math.random().toString(36).slice(2) });
  vi.stubGlobal("window", { localStorage: ls } as Window);
});

afterEach(() => {
  vi.unstubAllGlobals();
  for (const k of Object.keys(store)) delete store[k];
});

const validPayload = {
  kind: "VOICE" as const,
  title: "Enough chars title",
  body: "Enough characters in body for validation rules.",
};

describe("queuedReportPayloadSchema", () => {
  it("rejects latitude without longitude", () => {
    const r = queuedReportPayloadSchema.safeParse({ ...validPayload, latitude: 5.5 });
    expect(r.success).toBe(false);
  });

  it("accepts coordinate pair", () => {
    const r = queuedReportPayloadSchema.safeParse({
      ...validPayload,
      latitude: 5.5,
      longitude: -0.2,
    });
    expect(r.success).toBe(true);
  });
});

describe("isRetryableReportSubmitResponse", () => {
  it("matches retryable statuses", () => {
    expect(isRetryableReportSubmitResponse(503)).toBe(true);
    expect(isRetryableReportSubmitResponse(429)).toBe(true);
    expect(isRetryableReportSubmitResponse(400)).toBe(false);
  });
});

describe("report queue", () => {
  it("enqueue and load round-trip", () => {
    enqueueReportDraft(validPayload);
    const q = loadReportQueue();
    expect(q).toHaveLength(1);
    expect(q[0].payload.title).toBe(validPayload.title);
  });

  it("remove item", () => {
    enqueueReportDraft(validPayload);
    const id = loadReportQueue()[0].id;
    removeReportQueueItem(id);
    expect(loadReportQueue()).toHaveLength(0);
  });

  it("caps at MAX_QUEUED_REPORTS", () => {
    for (let i = 0; i < MAX_QUEUED_REPORTS + 2; i++) {
      enqueueReportDraft({
        ...validPayload,
        title: `Title number ${i} with enough length`,
      });
    }
    expect(loadReportQueue()).toHaveLength(MAX_QUEUED_REPORTS);
    expect(loadReportQueue()[0].payload.title).toContain("2 with enough");
  });

  it("clearReportQueue empties storage", () => {
    enqueueReportDraft(validPayload);
    clearReportQueue();
    expect(loadReportQueue()).toHaveLength(0);
  });

  it("ignores corrupt storage entries", () => {
    lsSeedStore([{ id: "x", createdAt: 1, payload: { bad: true } }]);
    expect(loadReportQueue()).toHaveLength(0);
  });
});

function lsSeedStore(data: unknown) {
  store["mbkru_report_queue_v1"] = JSON.stringify(data);
}
