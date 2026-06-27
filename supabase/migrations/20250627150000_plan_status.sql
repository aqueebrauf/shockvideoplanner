ALTER TABLE videoplanner.plans
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'not started'
  CHECK (status IN ('not started', 'completed'));
