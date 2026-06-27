ALTER TABLE videoplanner.plans
  ADD COLUMN IF NOT EXISTS screen_sequence_name text NOT NULL DEFAULT '';
