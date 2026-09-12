-- Goals: add hashtag column (same shape as this_people.hashtag)
ALTER TABLE videoplanner.goals
  ADD COLUMN IF NOT EXISTS hashtag text NOT NULL DEFAULT '';

-- Character names: Tom -> Anni, Rick -> Aftab
UPDATE videoplanner.characters
SET name = 'Anni'
WHERE name = 'Tom';

UPDATE videoplanner.characters
SET name = 'Aftab'
WHERE name = 'Rick';

UPDATE videoplanner.plans
SET character_name = 'Anni'
WHERE character_name = 'Tom';

UPDATE videoplanner.plans
SET character_name = 'Aftab'
WHERE character_name = 'Rick';

-- Remove Screens and CTAs resource tables
DROP TABLE IF EXISTS videoplanner.screens;
DROP TABLE IF EXISTS videoplanner.ctas;
