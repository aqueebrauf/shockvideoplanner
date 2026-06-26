import { dataUrlToBlob } from './db/helpers';
import { SCREEN_IMAGES_BUCKET, supabase } from './supabase';

export async function uploadScreenImage(screenId, dataUrl) {
  const blob = dataUrlToBlob(dataUrl);
  const path = `${screenId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from(SCREEN_IMAGES_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(SCREEN_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
