import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';

export const CATEGORIES = ['broad', 'medium', 'niche'];

export function normalizeHashtag(row) {
  const postsRaw = row.posts ?? null;
  const posts =
    postsRaw == null || postsRaw === '' || Number.isNaN(Number(postsRaw))
      ? null
      : Math.round(Number(postsRaw));

  return {
    id: row.id,
    hashtag: row.hashtag ?? '',
    posts,
    category: row.category ?? 'broad',
  };
}

function toRow(hashtag) {
  return {
    id: hashtag.id,
    hashtag: hashtag.hashtag,
    posts: hashtag.posts,
    category: hashtag.category,
  };
}

export async function fetchHashtags() {
  const { data, error } = await supabase.from('hashtags').select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeHashtag);
}

export async function upsertHashtag(hashtag) {
  const { data, error } = await supabase
    .from('hashtags')
    .upsert(toRow(hashtag))
    .select()
    .single();
  if (error) throw error;
  return normalizeHashtag(data);
}

export async function deleteHashtagById(id) {
  const { error } = await supabase.from('hashtags').delete().eq('id', id);
  if (error) throw error;
}

export function nextHashtagId(hashtags) {
  return nextIdFromRows(hashtags);
}
