-- Searchable keyword expansion per hashtag (auto-filled from tag text + themes)
ALTER TABLE videoplanner.hashtags
  ADD COLUMN IF NOT EXISTS keywords text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS hashtags_keywords_gin
  ON videoplanner.hashtags USING gin (keywords);
