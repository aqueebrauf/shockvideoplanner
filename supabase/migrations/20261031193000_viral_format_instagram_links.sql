ALTER TABLE videoplanner.viral_formats
  ADD COLUMN IF NOT EXISTS instagram_links jsonb NOT NULL DEFAULT '[]'::jsonb;
