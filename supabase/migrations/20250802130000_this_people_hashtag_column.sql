-- Split caption and hashtag into separate columns
ALTER TABLE videoplanner.this_people
  ADD COLUMN IF NOT EXISTS hashtag text NOT NULL DEFAULT '';

UPDATE videoplanner.this_people
SET
  hashtag = trim(regexp_replace(caption, '^[^#]*', '')),
  caption = trim(regexp_replace(caption, '\s*#\S+(?:\s+#\S+)*\s*$', ''))
WHERE caption ~ '#\S'
  AND (hashtag IS NULL OR hashtag = '');

UPDATE videoplanner.this_people
SET
  caption = 'Best tool to stay on track for exam prep',
  hashtag = '#study'
WHERE id = 1
  AND caption LIKE '%#study%';
