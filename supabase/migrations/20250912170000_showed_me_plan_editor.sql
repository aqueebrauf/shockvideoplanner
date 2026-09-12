-- Aftab and Anni are editors. Keep the existing people table and assign plans to them.
INSERT INTO videoplanner.characters (id, name)
VALUES (1, 'Anni'), (2, 'Aftab')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

ALTER TABLE videoplanner.showed_me_plans
  ADD COLUMN IF NOT EXISTS editor_id integer
  REFERENCES videoplanner.characters(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS showed_me_plans_editor_id_idx
  ON videoplanner.showed_me_plans (editor_id);
