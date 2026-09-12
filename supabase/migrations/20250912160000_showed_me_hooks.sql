-- Goal-linked hook copies for Showed Me reels
CREATE TABLE IF NOT EXISTS videoplanner.showed_me_hooks (
  id integer PRIMARY KEY,
  goal_id integer REFERENCES videoplanner.goals(id) ON DELETE SET NULL,
  text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON videoplanner.showed_me_hooks TO anon, authenticated, service_role;

ALTER TABLE videoplanner.showed_me_hooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_showed_me_hooks" ON videoplanner.showed_me_hooks
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
