-- Shared demo videos per goal + background setup (reused across Showed Me plans)
CREATE TABLE IF NOT EXISTS videoplanner.goal_demo_backgrounds (
  id integer PRIMARY KEY,
  goal_id integer NOT NULL REFERENCES videoplanner.goals(id) ON DELETE CASCADE,
  background_name text NOT NULL DEFAULT '',
  demo_storage_key text NOT NULL DEFAULT '',
  demo_public_url text NOT NULL DEFAULT '',
  demo_mime_type text NOT NULL DEFAULT '',
  frame_storage_key text NOT NULL DEFAULT '',
  frame_public_url text NOT NULL DEFAULT '',
  frame_mime_type text NOT NULL DEFAULT 'image/jpeg',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS goal_demo_backgrounds_goal_id_idx
  ON videoplanner.goal_demo_backgrounds (goal_id);

ALTER TABLE videoplanner.person_video_plans
  ADD COLUMN IF NOT EXISTS demo_library_id integer
  REFERENCES videoplanner.goal_demo_backgrounds(id) ON DELETE SET NULL;

GRANT ALL ON videoplanner.goal_demo_backgrounds TO anon, authenticated, service_role;

ALTER TABLE videoplanner.goal_demo_backgrounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_goal_demo_backgrounds" ON videoplanner.goal_demo_backgrounds
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
