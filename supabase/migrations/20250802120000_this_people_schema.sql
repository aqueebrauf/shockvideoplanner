-- This person resource (goal-linked hook + caption templates)
CREATE TABLE IF NOT EXISTS videoplanner.this_people (
  id integer PRIMARY KEY,
  goal_id integer REFERENCES videoplanner.goals(id) ON DELETE SET NULL,
  hook_text text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON videoplanner.this_people TO anon, authenticated, service_role;

ALTER TABLE videoplanner.this_people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_this_people" ON videoplanner.this_people
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Goal referenced by first entry
INSERT INTO videoplanner.goals (id, title, link, date_label)
VALUES (12, 'Study 6h everyday', '', '')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO videoplanner.this_people (id, goal_id, hook_text, caption)
VALUES (
  1,
  (SELECT id FROM videoplanner.goals WHERE title = 'Study 6h everyday' LIMIT 1),
  'This topper showed me how he tracks his study plan',
  'Best tool to stay on track for exam prep #study'
)
ON CONFLICT (id) DO NOTHING;
