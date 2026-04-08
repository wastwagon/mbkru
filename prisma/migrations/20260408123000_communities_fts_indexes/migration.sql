-- GIN indexes for GET /api/communities/search (plainto_tsquery + to_tsvector)
CREATE INDEX IF NOT EXISTS "Community_fts_idx" ON "Community" USING gin (
  to_tsvector(
    'simple',
    coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce("traditionalAreaName", '')
  )
);

CREATE INDEX IF NOT EXISTS "CommunityPost_body_fts_idx" ON "CommunityPost" USING gin (
  to_tsvector('simple', coalesce(body, ''))
);
