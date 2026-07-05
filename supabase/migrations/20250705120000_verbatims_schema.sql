CREATE TABLE IF NOT EXISTS videoplanner.verbatims (
  id integer PRIMARY KEY,
  text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON videoplanner.verbatims TO anon, authenticated, service_role;

ALTER TABLE videoplanner.verbatims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_verbatims" ON videoplanner.verbatims
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
