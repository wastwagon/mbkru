-- MBKRU Voice + accessibility UI telemetry (see `MbkruVoiceAnalyticsEvent` in schema.prisma).
-- Idempotent for databases that already created the table via runtime bootstrap.
CREATE TABLE IF NOT EXISTS "mbkru_voice_analytics_events" (
    "id" BIGSERIAL NOT NULL,
    "event_name" VARCHAR(120) NOT NULL,
    "source" VARCHAR(32) NOT NULL DEFAULT 'client',
    "language" VARCHAR(16),
    "payload" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mbkru_voice_analytics_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_mbkru_voice_analytics_events_created_at"
ON "mbkru_voice_analytics_events" ("created_at");

CREATE INDEX IF NOT EXISTS "idx_mbkru_voice_analytics_events_event_name"
ON "mbkru_voice_analytics_events" ("event_name");
