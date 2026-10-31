-- Collapse viral formats to app, format name, priority, sample videos,
-- and original/smash text of hook copy + notes. Links live inside original notes.

ALTER TABLE videoplanner.viral_formats
  ADD COLUMN IF NOT EXISTS sample_videos jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'videoplanner'
      AND table_name = 'viral_formats'
      AND column_name = 'links'
  ) THEN
    UPDATE videoplanner.viral_formats AS vf
    SET
      original = jsonb_build_object(
        'hookCopy', COALESCE(vf.original->>'hookCopy', ''),
        'notes', btrim(concat_ws(
          E'\n\n',
          NULLIF(btrim(COALESCE(vf.original->>'hookDescription', '')), ''),
          NULLIF(btrim(COALESCE(vf.original->>'videoCopy', '')), ''),
          NULLIF(btrim(COALESCE(vf.original->>'videoDescription', '')), ''),
          NULLIF(btrim(COALESCE(vf.original->>'notes', '')), ''),
          NULLIF(btrim(COALESCE((
            SELECT string_agg(line, E'\n\n')
            FROM (
              SELECT CASE
                WHEN COALESCE(link->>'url', '') <> '' AND COALESCE(link->>'label', '') <> ''
                  THEN (link->>'label') || E'\n' || (link->>'url')
                WHEN COALESCE(link->>'url', '') <> '' THEN link->>'url'
                ELSE NULLIF(btrim(COALESCE(link->>'label', '')), '')
              END AS line
              FROM jsonb_array_elements(COALESCE(vf.links, '[]'::jsonb)) AS link
            ) lines
          ), '')), '')
        ))
      ),
      smash = jsonb_build_object(
        'hookCopy', COALESCE(vf.smash->>'hookCopy', ''),
        'notes', btrim(concat_ws(
          E'\n\n',
          NULLIF(btrim(COALESCE(vf.smash->>'hookDescription', '')), ''),
          NULLIF(btrim(COALESCE(vf.smash->>'videoCopy', '')), ''),
          NULLIF(btrim(COALESCE(vf.smash->>'videoDescription', '')), ''),
          NULLIF(btrim(COALESCE(vf.smash->>'notes', '')), '')
        ))
      ),
      sample_videos = CASE
        WHEN COALESCE(vf.sample_video_url, '') <> '' THEN jsonb_build_array(
          jsonb_build_object(
            'id', 'legacy-original',
            'key', COALESCE(vf.sample_video_key, ''),
            'url', vf.sample_video_url,
            'name', COALESCE(vf.sample_video_name, '')
          )
        )
        ELSE COALESCE(vf.sample_videos, '[]'::jsonb)
      END;
  END IF;
END $$;

ALTER TABLE videoplanner.viral_formats
  DROP COLUMN IF EXISTS founder,
  DROP COLUMN IF EXISTS show_name,
  DROP COLUMN IF EXISTS links,
  DROP COLUMN IF EXISTS sample_video_key,
  DROP COLUMN IF EXISTS sample_video_url,
  DROP COLUMN IF EXISTS sample_video_name,
  DROP COLUMN IF EXISTS smash_video_key,
  DROP COLUMN IF EXISTS smash_video_url,
  DROP COLUMN IF EXISTS smash_video_name;
