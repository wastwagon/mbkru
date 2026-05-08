import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

type AnalyticsRow = {
  event_name: string;
  count: bigint | number;
};

type SourceRow = {
  source: string;
  count: bigint | number;
};

export type MbkruVoiceAnalyticsDays = 7 | 30 | 90;

export function parseMbkruVoiceAnalyticsDaysParam(raw: string | null): MbkruVoiceAnalyticsDays {
  if (!raw) return 30;
  const n = Number.parseInt(raw, 10);
  if (n === 7 || n === 30 || n === 90) return n;
  return 30;
}

function toNumber(value: bigint | number): number {
  return typeof value === "bigint" ? Number(value) : value;
}

let initPromise: Promise<void> | null = null;

async function ensureAnalyticsTable(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS mbkru_voice_analytics_events (
          id BIGSERIAL PRIMARY KEY,
          event_name VARCHAR(120) NOT NULL,
          source VARCHAR(32) NOT NULL DEFAULT 'client',
          language VARCHAR(16),
          payload JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_mbkru_voice_analytics_events_created_at
        ON mbkru_voice_analytics_events (created_at);
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_mbkru_voice_analytics_events_event_name
        ON mbkru_voice_analytics_events (event_name);
      `);
    })();
  }
  await initPromise;
}

export type MbkruVoiceAnalyticsInsert = {
  eventName: string;
  source: "client" | "server";
  language: string | null;
  payload: unknown;
};

export async function recordMbkruVoiceAnalyticsEvent(input: MbkruVoiceAnalyticsInsert): Promise<void> {
  await ensureAnalyticsTable();
  await prisma.mbkruVoiceAnalyticsEvent.create({
    data: {
      eventName: input.eventName,
      source: input.source,
      language: input.language,
      payload: (input.payload ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function listMbkruVoiceAnalyticsEventRows(params: {
  page: number;
  pageSize: number;
  eventNameContains?: string | null;
}) {
  await ensureAnalyticsTable();

  const pageSize = Math.min(100, Math.max(1, params.pageSize));
  const page = Math.max(1, params.page);
  const skip = (page - 1) * pageSize;

  const q = params.eventNameContains?.trim();
  const where: Prisma.MbkruVoiceAnalyticsEventWhereInput =
    q && q.length > 0 ? { eventName: { contains: q, mode: "insensitive" } } : {};

  const [rows, total] = await Promise.all([
    prisma.mbkruVoiceAnalyticsEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
      select: {
        id: true,
        eventName: true,
        source: true,
        language: true,
        payload: true,
        createdAt: true,
      },
    }),
    prisma.mbkruVoiceAnalyticsEvent.count({ where }),
  ]);

  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getMbkruVoiceAnalyticsSummary(days: MbkruVoiceAnalyticsDays = 30) {
  await ensureAnalyticsTable();

  const [windowRows, bySourceRows] = await Promise.all([
    prisma.$queryRawUnsafe<AnalyticsRow[]>(
      `
        SELECT event_name, COUNT(*)::bigint AS count
        FROM mbkru_voice_analytics_events
        WHERE created_at >= NOW() - ($1::int || ' days')::interval
        GROUP BY event_name
        ORDER BY count DESC, event_name ASC
      `,
      days,
    ),
    prisma.$queryRawUnsafe<SourceRow[]>(
      `
        SELECT source, COUNT(*)::bigint AS count
        FROM mbkru_voice_analytics_events
        WHERE created_at >= NOW() - ($1::int || ' days')::interval
        GROUP BY source
        ORDER BY count DESC, source ASC
      `,
      days,
    ),
  ]);

  return {
    windowDays: days,
    windowRows: windowRows.map((row) => ({ eventName: row.event_name, count: toNumber(row.count) })),
    bySourceWindow: bySourceRows.map((row) => ({ source: row.source, count: toNumber(row.count) })),
  };
}

function csvCell(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function mbkruVoiceAnalyticsSummaryToCsv(summary: Awaited<ReturnType<typeof getMbkruVoiceAnalyticsSummary>>): string {
  const lines: string[] = [];
  lines.push("section,key,count");

  for (const row of summary.windowRows) {
    lines.push([csvCell(`window_${summary.windowDays}_days`), csvCell(row.eventName), csvCell(row.count)].join(","));
  }
  for (const row of summary.bySourceWindow) {
    lines.push([csvCell(`by_source_${summary.windowDays}_days`), csvCell(row.source), csvCell(row.count)].join(","));
  }

  return lines.join("\n");
}
