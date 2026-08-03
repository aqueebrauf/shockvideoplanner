import { compactHashtagKeywords } from '../../shared/hashtagMatching.js';
import { supabase } from './supabase';
import { nextIdFromRows } from './db/helpers';
import { fetchAllHashtagRows } from '../../shared/fetchHashtagRows.js';

export const CATEGORIES = ['broad', 'medium', 'niche'];

export function normalizeHashtag(row) {
  const postsRaw = row.posts ?? null;
  const posts =
    postsRaw == null || postsRaw === '' || Number.isNaN(Number(postsRaw))
      ? null
      : Math.round(Number(postsRaw));
  const themes = Array.isArray(row.themes) ? row.themes : [];
  const storedKeywords = Array.isArray(row.keywords) ? row.keywords : [];
  const keywords =
    storedKeywords.length > 0
      ? storedKeywords
      : compactHashtagKeywords(row.hashtag ?? '', themes);

  return {
    id: row.id,
    hashtag: row.hashtag ?? '',
    posts,
    category: row.category ?? 'broad',
    themes,
    keywords,
  };
}

function toRow(hashtag) {
  const themes = hashtag.themes ?? [];
  const keywords =
    hashtag.keywords?.length > 0
      ? hashtag.keywords
      : compactHashtagKeywords(hashtag.hashtag ?? '', themes);

  return {
    id: hashtag.id,
    hashtag: hashtag.hashtag,
    posts: hashtag.posts,
    category: hashtag.category,
    themes,
    keywords,
  };
}

export async function fetchHashtags() {
  const data = await fetchAllHashtagRows(supabase);
  return data.map(normalizeHashtag);
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

export function formatThemes(themes) {
  return (themes ?? []).join(', ');
}

export function parseThemesInput(value) {
  return value
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export function formatKeywords(keywords) {
  return (keywords ?? []).join(', ');
}

export function parseKeywordsInput(value) {
  return value
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

/** Recompute keywords from hashtag text + themes (keeps manual extras if provided). */
export function refreshHashtagKeywords(hashtag, { keepManual = false } = {}) {
  const auto = compactHashtagKeywords(hashtag.hashtag ?? '', hashtag.themes ?? []);
  if (!keepManual || !hashtag.keywords?.length) {
    return auto;
  }
  return [...new Set([...hashtag.keywords, ...auto])];
}
