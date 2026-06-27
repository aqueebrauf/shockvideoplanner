-- Link plans to resource rows by ID (single source of truth)

ALTER TABLE videoplanner.plans
  ADD COLUMN IF NOT EXISTS character_id integer REFERENCES videoplanner.characters (id),
  ADD COLUMN IF NOT EXISTS goal_id integer REFERENCES videoplanner.goals (id),
  ADD COLUMN IF NOT EXISTS caption_style_id integer REFERENCES videoplanner.captions (id),
  ADD COLUMN IF NOT EXISTS screen_sequence_id text REFERENCES videoplanner.screen_sequences (id);

UPDATE videoplanner.plans p
SET character_id = c.id
FROM videoplanner.characters c
WHERE p.character_id IS NULL
  AND trim(p.character_name) <> ''
  AND lower(trim(p.character_name)) = lower(trim(c.name));

UPDATE videoplanner.plans p
SET goal_id = g.id
FROM videoplanner.goals g
WHERE p.goal_id IS NULL
  AND trim(p.goal_name) <> ''
  AND lower(trim(p.goal_name)) = lower(trim(g.title));

UPDATE videoplanner.plans p
SET caption_style_id = c.id
FROM videoplanner.captions c
WHERE p.caption_style_id IS NULL
  AND trim(p.caption_style) <> ''
  AND lower(p.caption_style) <> 'intelligent'
  AND lower(trim(p.caption_style)) = lower(trim(c.style));

UPDATE videoplanner.plans p
SET screen_sequence_id = s.id
FROM videoplanner.screen_sequences s
WHERE p.screen_sequence_id IS NULL
  AND trim(p.screen_sequence_name) <> ''
  AND lower(trim(p.screen_sequence_name)) = lower(trim(s.name));

UPDATE videoplanner.plans
SET screen_sequence_id = 'primary-demo'
WHERE screen_sequence_id IS NULL
  AND trim(screen_sequence_name) = ''
  AND EXISTS (
    SELECT 1 FROM videoplanner.screen_sequences WHERE id = 'primary-demo'
  );

CREATE INDEX IF NOT EXISTS plans_character_id_idx ON videoplanner.plans (character_id);
CREATE INDEX IF NOT EXISTS plans_goal_id_idx ON videoplanner.plans (goal_id);
