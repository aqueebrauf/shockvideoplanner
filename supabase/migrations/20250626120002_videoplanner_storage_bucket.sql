INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videoplanner-screens',
  'videoplanner-screens',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_videoplanner_screens"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'videoplanner-screens');

CREATE POLICY "public_insert_videoplanner_screens"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'videoplanner-screens');

CREATE POLICY "public_update_videoplanner_screens"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'videoplanner-screens')
WITH CHECK (bucket_id = 'videoplanner-screens');

CREATE POLICY "public_delete_videoplanner_screens"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'videoplanner-screens');
