-- Verbatim extraction status
ALTER TABLE videoplanner.verbatims
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'not_started'
  CHECK (status IN ('not_started', 'extracted'));

-- Hooks resource
CREATE TABLE IF NOT EXISTS videoplanner.hooks (
  id integer PRIMARY KEY,
  text text NOT NULL DEFAULT '',
  verbatim_id integer REFERENCES videoplanner.verbatims(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON videoplanner.hooks TO anon, authenticated, service_role;

ALTER TABLE videoplanner.hooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_hooks" ON videoplanner.hooks
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
