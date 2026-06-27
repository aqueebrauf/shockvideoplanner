-- Characters resource and plan character tracking

CREATE TABLE IF NOT EXISTS videoplanner.characters (
  id integer PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE videoplanner.plans
  ADD COLUMN IF NOT EXISTS character_name text NOT NULL DEFAULT '';

ALTER TABLE videoplanner.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_characters" ON videoplanner.characters
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO videoplanner.characters (id, name)
VALUES
  (1, 'Tom'),
  (2, 'Soon')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
