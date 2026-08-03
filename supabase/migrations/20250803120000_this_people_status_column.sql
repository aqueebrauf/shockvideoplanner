ALTER TABLE videoplanner.this_people
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'not started'
  CHECK (status IN ('not started', 'completed'));
