-- Viral format swipe file: original short-form mechanics and Smash versions.
CREATE TABLE IF NOT EXISTS videoplanner.viral_formats (
  id integer PRIMARY KEY,
  sort_order integer NOT NULL DEFAULT 0,
  app_name text NOT NULL DEFAULT '',
  format_name text NOT NULL DEFAULT '',
  founder text NOT NULL DEFAULT '',
  show_name text NOT NULL DEFAULT '',
  priority boolean NOT NULL DEFAULT false,
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  sample_video_key text NOT NULL DEFAULT '',
  sample_video_url text NOT NULL DEFAULT '',
  sample_video_name text NOT NULL DEFAULT '',
  smash_video_key text NOT NULL DEFAULT '',
  smash_video_url text NOT NULL DEFAULT '',
  smash_video_name text NOT NULL DEFAULT '',
  original jsonb NOT NULL DEFAULT '{}'::jsonb,
  smash jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS videoplanner.app_meta (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb
);

GRANT ALL ON videoplanner.viral_formats TO anon, authenticated, service_role;
GRANT ALL ON videoplanner.app_meta TO anon, authenticated, service_role;

ALTER TABLE videoplanner.viral_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE videoplanner.app_meta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_viral_formats" ON videoplanner.viral_formats;
CREATE POLICY "anon_all_viral_formats" ON videoplanner.viral_formats
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_app_meta" ON videoplanner.app_meta;
CREATE POLICY "anon_all_app_meta" ON videoplanner.app_meta
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
